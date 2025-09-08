import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, checkUserPermissions } from '@/lib/auth-simple';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has super admin permissions
    const hasPermission = await checkUserPermissions(session.user.id, 'SUPER_ADMIN');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch customers with their subscription and guild information
    const customers = await prisma.user.findMany({
      where: {
        role: { in: ['GUILD_ADMIN', 'GUILD_MEMBER'] },
      },
      include: {
        guild: {
          select: {
            name: true,
            world: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
            expiresAt: true,
            amount: true,
          },
        },
        _count: {
          select: {
            paymentVerifications: true,
          },
        },
      },
      orderBy: [
        { subscription: { status: 'desc' } },
        { createdAt: 'desc' },
      ],
    });

    // Calculate total revenue per customer
    const customersWithRevenue = await Promise.all(
      customers.map(async (customer) => {
        const totalRevenue = await prisma.payment.aggregate({
          where: {
            subscription: {
              userId: customer.id,
            },
            status: 'completed',
          },
          _sum: {
            amount: true,
          },
        });

        return {
          id: customer.id,
          characterName: customer.characterName,
          guildName: customer.guild?.name || 'No Guild',
          world: customer.guild?.world || customer.world,
          subscriptionPlan: customer.subscription?.plan || 'None',
          status: customer.subscription?.status || 'Inactive',
          revenue: Number(totalRevenue._sum.amount || 0),
          joinDate: customer.createdAt.toISOString(),
          lastActive: customer.lastLoginAt?.toISOString() || customer.updatedAt.toISOString(),
          expiresAt: customer.subscription?.expiresAt?.toISOString(),
          paymentCount: customer._count.paymentVerifications,
        };
      })
    );

    return NextResponse.json(customersWithRevenue);
  } catch (error) {
    console.error('Customers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}


