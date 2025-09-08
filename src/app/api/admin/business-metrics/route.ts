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

    // Get current date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Revenue metrics
    const [
      monthlyRevenue,
      quarterlyRevenue,
      yearlyRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: 'completed',
          processedAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'completed',
          processedAt: { gte: startOfQuarter },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'completed',
          processedAt: { gte: startOfYear },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'completed',
          processedAt: { gte: lastMonth, lt: endOfLastMonth },
        },
        _sum: { amount: true },
      }),
    ]);

    // Calculate growth
    const currentMonthRevenue = Number(monthlyRevenue._sum.amount || 0);
    const previousMonthRevenue = Number(lastMonthRevenue._sum.amount || 0);
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

    // Customer metrics
    const [
      totalCustomers,
      activeCustomers,
      newCustomersThisMonth,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: { in: ['GUILD_ADMIN', 'GUILD_MEMBER'] } },
      }),
      prisma.user.count({
        where: { 
          role: { in: ['GUILD_ADMIN', 'GUILD_MEMBER'] },
          subscription: { status: 'ACTIVE' },
        },
      }),
      prisma.user.count({
        where: { 
          role: { in: ['GUILD_ADMIN', 'GUILD_MEMBER'] },
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    // Subscription metrics
    const [
      activeSubscriptions,
      pendingSubscriptions,
      cancelledSubscriptions,
    ] = await Promise.all([
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.subscription.count({ where: { status: 'CANCELLED' } }),
    ]);

    // Payment metrics
    const [
      pendingPayments,
      completedPayments,
      failedPayments,
    ] = await Promise.all([
      prisma.paymentVerification.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'completed' } }),
      prisma.payment.count({ where: { status: 'failed' } }),
    ]);

    // Calculate churn rate (simplified)
    const churnRate = totalCustomers > 0 
      ? ((totalCustomers - activeCustomers) / totalCustomers) * 100
      : 0;

    const businessMetrics = {
      revenue: {
        monthly: currentMonthRevenue,
        quarterly: Number(quarterlyRevenue._sum.amount || 0),
        yearly: Number(yearlyRevenue._sum.amount || 0),
        growth: Math.round(revenueGrowth * 100) / 100,
      },
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        new: newCustomersThisMonth,
        churn: Math.round(churnRate * 100) / 100,
      },
      subscriptions: {
        active: activeSubscriptions,
        pending: pendingSubscriptions,
        cancelled: cancelledSubscriptions,
        revenue: currentMonthRevenue,
      },
      payments: {
        pending: pendingPayments,
        completed: completedPayments,
        failed: failedPayments,
        totalVolume: currentMonthRevenue,
      },
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


