import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { guild: true },
    });

    if (!user || !user.guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
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
            level: true,
            vocation: true,
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
      timestamp: death.timestamp,
      level: death.level,
      type: death.type,
      killers: death.killers,
      description: death.description,
      player: {
        name: death.player.name,
        level: death.player.level,
        vocation: death.player.vocation,
        guild: death.player.guild,
      },
    }));

    return NextResponse.json(formattedDeaths);
  } catch (error) {
    console.error('Recent deaths error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
