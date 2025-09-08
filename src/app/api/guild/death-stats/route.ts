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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // Calculate date range
    let dateFilter: Date;
    switch (range) {
      case '24h':
        dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(0); // All time
    }

    // Get death statistics
    const [
      totalDeaths,
      pvpDeaths,
      pveDeaths,
      averageLevelResult,
    ] = await Promise.all([
      prisma.death.count({
        where: {
          player: { guildId: user.guildId },
          timestamp: { gte: dateFilter },
        },
      }),
      prisma.death.count({
        where: {
          player: { guildId: user.guildId },
          timestamp: { gte: dateFilter },
          type: 'PVP',
        },
      }),
      prisma.death.count({
        where: {
          player: { guildId: user.guildId },
          timestamp: { gte: dateFilter },
          type: 'PVE',
        },
      }),
      prisma.death.aggregate({
        where: {
          player: { guildId: user.guildId },
          timestamp: { gte: dateFilter },
        },
        _avg: { level: true },
      }),
    ]);

    // Get top killers (flatten killers arrays and count occurrences)
    const deaths = await prisma.death.findMany({
      where: {
        player: { guildId: user.guildId },
        timestamp: { gte: dateFilter },
        type: 'PVP', // Only PVP deaths for killers
      },
      select: {
        killers: true,
      },
    });

    // Count killer occurrences
    const killerCounts = new Map<string, number>();
    deaths.forEach(death => {
      death.killers.forEach(killer => {
        if (killer && killer.trim()) {
          const killerName = killer.trim();
          killerCounts.set(killerName, (killerCounts.get(killerName) || 0) + 1);
        }
      });
    });

    // Sort killers by count and get top 10
    const topKillers = Array.from(killerCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, kills]) => ({ name, kills }));

    // Get deaths by day for trends (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const deathsByDay = await prisma.$queryRaw`
      SELECT 
        DATE(timestamp) as date,
        COUNT(CASE WHEN type = 'PVP' THEN 1 END) as pvp,
        COUNT(CASE WHEN type = 'PVE' THEN 1 END) as pve
      FROM "Death" d
      JOIN "Player" p ON d."playerId" = p.id
      WHERE p."guildId" = ${user.guildId}
        AND d.timestamp >= ${sevenDaysAgo}
      GROUP BY DATE(timestamp)
      ORDER BY DATE(timestamp)
    ` as Array<{ date: Date; pvp: bigint; pve: bigint }>;

    const formattedDeathsByDay = deathsByDay.map(day => ({
      date: day.date.toISOString().split('T')[0],
      pvp: Number(day.pvp),
      pve: Number(day.pve),
    }));

    const stats = {
      totalDeaths,
      pvpDeaths,
      pveDeaths,
      averageLevel: averageLevelResult._avg.level || 0,
      topKillers,
      deathsByDay: formattedDeathsByDay,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Death stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch death statistics' },
      { status: 500 }
    );
  }
}


