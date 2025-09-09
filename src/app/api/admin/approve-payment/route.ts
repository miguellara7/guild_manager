import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const approvePaymentSchema = z.object({
  paymentId: z.string().min(1),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has super admin permissions
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate request data
    const validationResult = approvePaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { paymentId, notes } = validationResult.data;

    // Update payment verification status
    await prisma.paymentVerification.update({
      where: { id: paymentId },
      data: {
        status: 'APPROVED',
        verifiedAt: new Date(),
        verifiedBy: session.user.id,
        notes,
      },
    });

    // Update associated payment status
    const verification = await prisma.paymentVerification.findUnique({
      where: { id: paymentId },
      include: { payment: true },
    });

    if (verification?.payment) {
      await prisma.payment.update({
        where: { id: verification.payment.id },
        data: { status: 'COMPLETED' },
      });

      // Activate or extend subscription
      await prisma.subscription.upsert({
        where: { userId: verification.payment.userId },
        create: {
          userId: verification.payment.userId,
          plan: verification.payment.plan,
          status: 'ACTIVE',
          worldLimit: verification.payment.plan === 'BASIC' ? 1 : 10,
          tibiaCoinsOption: '200 TC',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          amount: verification.payment.amount,
          currency: verification.payment.currency,
        },
        update: {
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Extend 30 days
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment approved successfully',
    });
  } catch (error) {
    console.error('Approve payment error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to approve payment' },
      { status: 500 }
    );
  }
}


