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

    const user = session.user;
    
    // Get user's world subscriptions and enemy guild configurations
    const worldSubscriptions = await prisma.worldSubscription.findMany({
      where: { 
        userId: user.id,
        isActive: true,
      },
      include: {
        guildConfigurations: {
          where: {
            type: 'ENEMY',
            isActive: true,
          },
          include: {
            guild: {
              select: {
                id: true,
                name: true,
                world: true,
              },
            },
          },
        },
      },
    });

    // Get all enemy guild IDs
    const enemyGuildIds = worldSubscriptions.flatMap(ws => 
      ws.guildConfigurations.map(gc => gc.guild.id)
    );

    if (enemyGuildIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get enemy players from configured enemy guilds
    const enemyPlayers = await prisma.player.findMany({
      where: {
        guildId: {
          in: enemyGuildIds,
        },
      },
      include: {
        guild: {
          select: {
            name: true,
            world: true,
          },
        },
      },
      orderBy: [
        { isOnline: 'desc' }, // Online enemies first
        { level: 'desc' },
      ],
    });

    // Get user's main guild configurations to know which players to protect
    const userGuildIds = worldSubscriptions.flatMap(ws => 
      ws.guildConfigurations
        .filter(gc => gc.type === 'MAIN' || gc.type === 'ALLY')
        .map(gc => gc.guild.id)
    );

    // Calculate kills and threat levels for each enemy
    const enemiesWithStats = await Promise.all(
      enemyPlayers.map(async (enemy) => {
        // Count kills by this enemy (deaths caused to our allied guild members)
        const kills24h = await prisma.death.count({
          where: {
            killers: {
              has: enemy.name, // Check if enemy name is in killers array
            },
            player: {
              guildId: {
                in: userGuildIds.length > 0 ? userGuildIds : [user.guildId || ''],
              },
            },
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        });

        // Count deaths of this enemy
        const deaths24h = await prisma.death.count({
          where: {
            player: {
              name: enemy.name,
            },
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        });

        // Calculate threat level based on kills, level, and online status
        let threat: 'high' | 'medium' | 'low' = 'low';
        if (kills24h > 2 || (enemy.level > 300 && enemy.isOnline)) {
          threat = 'high';
        } else if (kills24h > 0 || enemy.level > 200) {
          threat = 'medium';
        }

        return {
          id: enemy.id,
          name: enemy.name,
          level: enemy.level,
          vocation: enemy.vocation,
          guild: enemy.guild?.name || 'Unknown',
          status: enemy.isOnline ? 'online' : 'offline',
          lastSeen: enemy.lastSeen?.toISOString() || enemy.updatedAt.toISOString(),
          kills24h,
          deaths24h,
          threat,
          addedDate: enemy.createdAt.toISOString(),
          isActive: true,
        };
      })
    );

    return NextResponse.json(enemiesWithStats);
  } catch (error) {
    console.error('Enemy players error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enemy players' },
      { status: 500 }
    );
  }
}
