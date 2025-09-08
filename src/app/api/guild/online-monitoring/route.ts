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
    
    if (!user.guildId) {
      return NextResponse.json({ error: 'User not in a guild' }, { status: 400 });
    }

    // Get all configured guilds for this user's world subscriptions (all worlds)
    const worldSubscriptions = await prisma.worldSubscription.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        guildConfigurations: {
          where: { isActive: true },
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

    // Collect all guild IDs that should be monitored
    const guildIds = new Set<string>();
    const guildTypeMap = new Map<string, string>();
    
    // Add user's main guild if it exists
    if (user.guildId) {
      guildIds.add(user.guildId);
      guildTypeMap.set(user.guildId, 'GUILD_MEMBER');
    }

    // Add configured guilds
    worldSubscriptions.forEach(worldSub => {
      worldSub.guildConfigurations.forEach(config => {
        guildIds.add(config.guildId);
        const playerType = config.type === 'ALLY' ? 'EXTERNAL_ALLY' : 
                          config.type === 'ENEMY' ? 'EXTERNAL_ENEMY' : 'GUILD_MEMBER';
        guildTypeMap.set(config.guildId, playerType);
      });
    });

    // Get all worlds from subscriptions
    const worlds = worldSubscriptions.map(ws => ws.world);

    // Get all online players from monitored guilds
    const onlinePlayers = await prisma.player.findMany({
      where: {
        OR: [
          {
            guildId: { in: Array.from(guildIds) },
            isOnline: true,
          },
          // Also include enemy players not in specific guilds but in configured worlds
          {
            world: { in: worlds },
            type: 'EXTERNAL_ENEMY',
            isOnline: true,
          },
        ],
      },
      include: {
        guild: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { level: 'desc' },
        { name: 'asc' },
      ],
    });

    // Format response
    const formattedPlayers = onlinePlayers.map(player => {
      // Determine player type based on guild configuration
      let playerType = 'EXTERNAL_ENEMY'; // default for unknown guilds
      
      if (player.guildId && guildTypeMap.has(player.guildId)) {
        playerType = guildTypeMap.get(player.guildId)!;
      } else if (player.type === 'EXTERNAL_ENEMY') {
        playerType = 'EXTERNAL_ENEMY';
      }

      return {
        id: player.id,
        name: player.name,
        level: player.level,
        vocation: player.vocation,
        type: playerType,
        guild: player.guild?.name || 'Unknown',
        lastSeen: player.lastSeen?.toISOString() || player.updatedAt.toISOString(),
        isOnline: player.isOnline,
      };
    });

    return NextResponse.json(formattedPlayers);
  } catch (error) {
    console.error('Online monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch online players' },
      { status: 500 }
    );
  }
}

