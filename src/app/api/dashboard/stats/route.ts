import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DashboardStats } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { guild: true, subscription: true },
    });

    if (!user || !user.guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    // Get current date for filtering
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch statistics
    const [
      totalPlayers,
      onlinePlayers,
      onlineEnemies,
      recentDeaths,
      alertsTriggered,
      worldsMonitored,
    ] = await Promise.all([
      // Total guild members
      prisma.player.count({
        where: {
          guildId: user.guildId,
          type: 'GUILD_MEMBER',
        },
      }),
      
      // Online guild members
      prisma.player.count({
        where: {
          guildId: user.guildId,
          type: 'GUILD_MEMBER',
          isOnline: true,
        },
      }),
      
      // Online enemies
      prisma.player.count({
        where: {
          world: user.world,
          type: 'EXTERNAL_ENEMY',
          isOnline: true,
        },
      }),
      
      // Recent deaths (last 24 hours)
      prisma.death.count({
        where: {
          player: {
            guildId: user.guildId,
          },
          timestamp: {
            gte: yesterday,
          },
        },
      }),
      
      // Alerts triggered (last 24 hours)
      prisma.notification.count({
        where: {
          sentAt: {
            gte: yesterday,
          },
          alertRule: {
            OR: [
              { userId: user.id },
              { guildId: user.guildId },
            ],
          },
        },
      }),
      
      // Worlds monitored (based on subscription)
      1, // Default to 1, will be updated based on subscription logic
    ]);

    const stats: DashboardStats = {
      totalPlayers,
      onlinePlayers,
      onlineEnemies,
      recentDeaths,
      alertsTriggered,
      subscriptionStatus: user.subscription?.status || 'inactive',
      worldsMonitored,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
