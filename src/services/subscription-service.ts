import { prisma } from '@/lib/db';
import { tibiaDataService } from './tibia-api';

export interface TibiaCoinsPaymentRequest {
  userId: string;
  characterName: string;
  world: string;
  amount: number; // Amount in Tibia Coins
  plan: 'BASIC' | 'EXTENDED';
  additionalWorlds?: number;
  transferDetails: {
    fromCharacter: string;
    toCharacter: string;
    timestamp: Date;
    screenshot?: string; // Base64 encoded screenshot
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tibiaCoinsPrice: number;
  usdPrice: number;
  worldLimit: number;
  features: string[];
  duration: number; // days
}

class SubscriptionService {
  // Predefined subscription plans
  private readonly plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      tibiaCoinsPrice: 750,
      usdPrice: 20,
      worldLimit: 1,
      duration: 30,
      features: [
        'Monitor 1 world',
        'Unlimited guild members',
        'Real-time notifications',
        'Death tracking (PvP/PvE)',
        'Enemy guild monitoring',
        'Mobile app access',
      ],
    },
    {
      id: 'extended',
      name: 'Extended World',
      tibiaCoinsPrice: 750,
      usdPrice: 20,
      worldLimit: 1, // +1 additional world per purchase
      duration: 30,
      features: [
        '+1 Additional world',
        'All Basic features',
        'Advanced analytics',
        'Priority support',
        'Custom alert rules',
      ],
    },
  ];

  /**
   * Get all available subscription plans
   */
  getPlans(): SubscriptionPlan[] {
    return this.plans;
  }

  /**
   * Get a specific plan by ID
   */
  getPlan(planId: string): SubscriptionPlan | null {
    return this.plans.find(plan => plan.id === planId) || null;
  }

  /**
   * Submit a Tibia Coins payment request
   */
  async submitPaymentRequest(request: TibiaCoinsPaymentRequest): Promise<string> {
    try {
      // Validate the user and character
      const user = await prisma.user.findUnique({
        where: { id: request.userId },
        include: { subscription: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify character exists and belongs to user
      if (user.characterName !== request.characterName || user.world !== request.world) {
        throw new Error('Character does not match user account');
      }

      // Verify the receiving character exists in Tibia
      const receivingCharacter = await tibiaDataService.getCharacter(request.transferDetails.toCharacter);
      if (!receivingCharacter.character) {
        throw new Error('Receiving character not found in Tibia database');
      }

      // Calculate subscription details
      const plan = this.getPlan(request.plan.toLowerCase());
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      let totalAmount = plan.tibiaCoinsPrice;
      let worldLimit = plan.worldLimit;

      if (request.plan === 'EXTENDED' && request.additionalWorlds) {
        totalAmount = plan.tibiaCoinsPrice * request.additionalWorlds;
        worldLimit = request.additionalWorlds;
      }

      if (request.amount !== totalAmount) {
        throw new Error(`Invalid payment amount. Expected ${totalAmount} Tibia Coins`);
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          subscriptionId: user.subscription?.id || '', // Will be updated when subscription is created
          amount: plan.usdPrice,
          currency: 'USD',
          tibiaCoins: request.amount,
          status: 'pending',
          paymentMethod: 'tibia_coins',
          externalId: `TC_${Date.now()}_${user.id}`,
        },
      });

      // Create or update subscription
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.duration);

      let subscription;
      if (user.subscription) {
        // Extend existing subscription
        const currentExpiry = user.subscription.expiresAt > new Date() 
          ? user.subscription.expiresAt 
          : new Date();
        
        const newExpiry = new Date(currentExpiry);
        newExpiry.setDate(newExpiry.getDate() + plan.duration);

        subscription = await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: {
            worldLimit: request.plan === 'EXTENDED' 
              ? user.subscription.worldLimit + worldLimit
              : Math.max(user.subscription.worldLimit, worldLimit),
            expiresAt: newExpiry,
            status: 'PENDING_PAYMENT',
            nextBillingDate: newExpiry,
          },
        });
      } else {
        // Create new subscription
        subscription = await prisma.subscription.create({
          data: {
            userId: user.id,
            plan: request.plan,
            worldLimit,
            expiresAt,
            nextBillingDate: expiresAt,
            amount: plan.usdPrice,
            status: 'PENDING_PAYMENT',
          },
        });
      }

      // Update payment with subscription ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { subscriptionId: subscription.id },
      });

      // Create payment verification request
      await prisma.paymentVerification.create({
        data: {
          paymentId: payment.id,
          userId: user.id,
          fromCharacter: request.transferDetails.fromCharacter,
          toCharacter: request.transferDetails.toCharacter,
          amount: request.amount,
          transferTimestamp: request.transferDetails.timestamp,
          screenshot: request.transferDetails.screenshot,
          status: 'PENDING',
          submittedAt: new Date(),
        },
      });

      // Create notification for super admins
      await this.notifySuperAdmins(payment.id, user.characterName, request.amount);

      return payment.externalId!;
    } catch (error) {
      console.error('Payment request submission error:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        subscription: {
          include: {
            user: {
              select: {
                characterName: true,
                world: true,
              },
            },
          },
        },
        verification: true,
      },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    return {
      id: payment.externalId,
      status: payment.status,
      amount: payment.tibiaCoins,
      currency: 'Tibia Coins',
      submittedAt: payment.createdAt,
      processedAt: payment.processedAt,
      verification: payment.verification ? {
        status: payment.verification.status,
        reviewedAt: payment.verification.reviewedAt,
        reviewedBy: payment.verification.reviewedBy,
        notes: payment.verification.adminNotes,
      } : null,
    };
  }

  /**
   * Get user's subscription status
   */
  async getUserSubscription(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.subscription) {
      return {
        status: 'inactive',
        plan: null,
        worldLimit: 0,
        expiresAt: null,
        isExpired: true,
        daysRemaining: 0,
        recentPayments: [],
      };
    }

    const now = new Date();
    const isExpired = user.subscription.expiresAt < now;
    const daysRemaining = isExpired 
      ? 0 
      : Math.ceil((user.subscription.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      status: user.subscription.status,
      plan: user.subscription.plan,
      worldLimit: user.subscription.worldLimit,
      expiresAt: user.subscription.expiresAt,
      isExpired,
      daysRemaining,
      recentPayments: user.subscription.payments.map(payment => ({
        id: payment.externalId,
        amount: payment.tibiaCoins,
        status: payment.status,
        createdAt: payment.createdAt,
        processedAt: payment.processedAt,
      })),
    };
  }

  /**
   * Admin: Get pending payment verifications
   */
  async getPendingVerifications(): Promise<any[]> {
    const verifications = await prisma.paymentVerification.findMany({
      where: { status: 'PENDING' },
      include: {
        payment: {
          include: {
            subscription: {
              include: {
                user: {
                  select: {
                    characterName: true,
                    world: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    return verifications.map(verification => ({
      id: verification.id,
      paymentId: verification.payment.externalId,
      user: {
        characterName: verification.payment.subscription.user.characterName,
        world: verification.payment.subscription.user.world,
        email: verification.payment.subscription.user.email,
      },
      amount: verification.amount,
      fromCharacter: verification.fromCharacter,
      toCharacter: verification.toCharacter,
      transferTimestamp: verification.transferTimestamp,
      screenshot: verification.screenshot,
      submittedAt: verification.submittedAt,
      plan: verification.payment.subscription.plan,
    }));
  }

  /**
   * Admin: Approve payment verification
   */
  async approvePayment(verificationId: string, adminId: string, notes?: string): Promise<void> {
    try {
      const verification = await prisma.paymentVerification.findUnique({
        where: { id: verificationId },
        include: {
          payment: {
            include: {
              subscription: true,
            },
          },
        },
      });

      if (!verification) {
        throw new Error('Verification not found');
      }

      if (verification.status !== 'PENDING') {
        throw new Error('Verification already processed');
      }

      // Update verification
      await prisma.paymentVerification.update({
        where: { id: verificationId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: adminId,
          adminNotes: notes,
        },
      });

      // Update payment
      await prisma.payment.update({
        where: { id: verification.paymentId },
        data: {
          status: 'completed',
          processedAt: new Date(),
        },
      });

      // Activate subscription
      await prisma.subscription.update({
        where: { id: verification.payment.subscriptionId },
        data: {
          status: 'ACTIVE',
          lastPaymentAt: new Date(),
        },
      });

      console.log(`Payment approved for verification ${verificationId}`);
    } catch (error) {
      console.error('Payment approval error:', error);
      throw error;
    }
  }

  /**
   * Admin: Reject payment verification
   */
  async rejectPayment(verificationId: string, adminId: string, reason: string): Promise<void> {
    try {
      const verification = await prisma.paymentVerification.findUnique({
        where: { id: verificationId },
        include: {
          payment: {
            include: {
              subscription: true,
            },
          },
        },
      });

      if (!verification) {
        throw new Error('Verification not found');
      }

      if (verification.status !== 'PENDING') {
        throw new Error('Verification already processed');
      }

      // Update verification
      await prisma.paymentVerification.update({
        where: { id: verificationId },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: adminId,
          adminNotes: reason,
        },
      });

      // Update payment
      await prisma.payment.update({
        where: { id: verification.paymentId },
        data: {
          status: 'failed',
          processedAt: new Date(),
        },
      });

      // Keep subscription in pending state or cancel if needed
      await prisma.subscription.update({
        where: { id: verification.payment.subscriptionId },
        data: {
          status: 'CANCELLED',
        },
      });

      console.log(`Payment rejected for verification ${verificationId}: ${reason}`);
    } catch (error) {
      console.error('Payment rejection error:', error);
      throw error;
    }
  }

  /**
   * Check and update expired subscriptions
   */
  async processExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    for (const subscription of expiredSubscriptions) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'INACTIVE' },
      });

      console.log(`Subscription ${subscription.id} expired and deactivated`);
    }
  }

  /**
   * Notify super admins about new payment requests
   */
  private async notifySuperAdmins(paymentId: string, characterName: string, amount: number): Promise<void> {
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true, characterName: true },
    });

    const notifications = superAdmins.map(admin => ({
      title: 'New Payment Verification Required',
      message: `${characterName} submitted a payment of ${amount} Tibia Coins for verification.`,
      type: 'payment_verification',
      priority: 'high' as const,
      metadata: {
        paymentId,
        characterName,
        amount,
      },
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true,
      });
    }
  }

  /**
   * Get subscription analytics for admin
   */
  async getSubscriptionAnalytics(): Promise<any> {
    const [
      totalSubscriptions,
      activeSubscriptions,
      pendingPayments,
      monthlyRevenue,
      recentPayments
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.paymentVerification.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({
        where: {
          status: 'completed',
          processedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: { status: 'completed' },
        include: {
          subscription: {
            include: {
              user: {
                select: { characterName: true, world: true },
              },
            },
          },
        },
        orderBy: { processedAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalSubscriptions,
      activeSubscriptions,
      pendingPayments,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      conversionRate: totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions) * 100 : 0,
      recentPayments: recentPayments.map(payment => ({
        id: payment.externalId,
        characterName: payment.subscription.user.characterName,
        world: payment.subscription.user.world,
        amount: payment.tibiaCoins,
        processedAt: payment.processedAt,
      })),
    };
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
export default subscriptionService;


