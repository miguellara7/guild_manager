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

    // Get recent deaths from guild members
    const recentDeaths = await prisma.death.findMany({
      where: {
        player: {
          guildId: user.guildId,
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
      take: 20, // Last 20 deaths
    });

    // Format the response
    const formattedDeaths = recentDeaths.map(death => ({
      id: death.id,
      playerName: death.player.name,
      level: death.level,
      type: death.type,
      killers: death.killers,
      timestamp: death.timestamp.toISOString(),
      description: death.description,
    }));

    return NextResponse.json(formattedDeaths);
  } catch (error) {
    console.error('Recent deaths error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent deaths' },
      { status: 500 }
    );
  }
}


