import { prisma } from '@/lib/db';
import { UserWithRelations } from '@/types';

export async function getUserWithGuild(userId: string): Promise<UserWithRelations | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      guild: {
        include: {
          users: {
            select: {
              id: true,
              characterName: true,
              role: true,
              lastLoginAt: true,
            },
          },
          players: {
            select: {
              id: true,
              name: true,
              level: true,
              vocation: true,
              type: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      subscription: true,
      paymentVerifications: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  });

  return user as UserWithRelations;
}

export async function getGuildStats(guildId: string) {
  const [
    totalMembers,
    onlineMembers,
    onlineEnemies,
    recentDeaths,
  ] = await Promise.all([
    prisma.player.count({
      where: {
        guildId: guildId,
        type: 'GUILD_MEMBER',
      },
    }),
    prisma.player.count({
      where: {
        guildId: guildId,
        type: 'GUILD_MEMBER',
        isOnline: true,
      },
    }),
    prisma.player.count({
      where: {
        world: await getGuildWorld(guildId),
        type: 'EXTERNAL_ENEMY',
        isOnline: true,
      },
    }),
    prisma.death.count({
      where: {
        player: {
          guildId: guildId,
        },
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    }),
  ]);

  // Get level statistics
  const levelStats = await prisma.player.aggregate({
    where: {
      guildId: guildId,
      type: 'GUILD_MEMBER',
    },
    _avg: {
      level: true,
    },
    _max: {
      level: true,
    },
  });

  // Get death type breakdown
  const deathStats = await prisma.death.groupBy({
    by: ['type'],
    where: {
      player: {
        guildId: guildId,
      },
      timestamp: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    _count: {
      id: true,
    },
  });

  const pvpDeaths = deathStats.find(d => d.type === 'PVP')?._count.id || 0;
  const pveDeaths = deathStats.find(d => d.type === 'PVE')?._count.id || 0;

  return {
    totalMembers,
    onlineMembers,
    onlineEnemies,
    recentDeaths,
    pvpDeaths,
    pveDeaths,
    averageLevel: Math.round(levelStats._avg.level || 0),
    highestLevel: levelStats._max.level || 0,
  };
}

async function getGuildWorld(guildId: string): Promise<string> {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { world: true },
  });
  return guild?.world || 'Antica';
}
