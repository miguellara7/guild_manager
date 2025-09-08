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

    // Get deaths from guild members
    const deaths = await prisma.death.findMany({
      where: {
        player: {
          guildId: user.guildId,
        },
        timestamp: {
          gte: dateFilter,
        },
      },
      include: {
        player: {
          select: {
            name: true,
            guild: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100, // Limit for performance
    });

    // Format response
    const formattedDeaths = deaths.map(death => ({
      id: death.id,
      playerName: death.player.name,
      level: death.level,
      type: death.type,
      killers: death.killers,
      timestamp: death.timestamp.toISOString(),
      description: death.description,
      guild: death.player.guild?.name || 'Unknown',
    }));

    return NextResponse.json(formattedDeaths);
  } catch (error) {
    console.error('Deaths fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deaths' },
      { status: 500 }
    );
  }
}


