import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has super admin permissions
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get basic metrics
    const [
      totalUsers,
      activeSubscriptions,
      pendingPayments,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count({ 
        where: { 
          role: { in: ['GUILD_ADMIN', 'GUILD_MEMBER'] } 
        } 
      }),
      prisma.subscription.count({ 
        where: { 
          status: 'ACTIVE' 
        } 
      }),
      prisma.paymentVerification.count({ 
        where: { 
          status: 'PENDING' 
        } 
      }),
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
    ]);

    const businessMetrics = {
      totalUsers,
      activeSubscriptions,
      pendingPayments,
      monthlyRevenue: Number(totalRevenue._sum.amount || 0),
      totalRevenue: Number(totalRevenue._sum.amount || 0),
    };

    return NextResponse.json(businessMetrics);
  } catch (error) {
    console.error('Business metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business metrics' },
      { status: 500 }
    );
  }
}