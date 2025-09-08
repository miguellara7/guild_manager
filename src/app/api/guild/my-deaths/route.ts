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

    // Get my deaths
    const myDeaths = await prisma.death.findMany({
      where: {
        player: {
          name: user.characterName, // Assuming player name matches character name
          guildId: user.guildId,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 10, // Last 10 deaths
    });

    // Format the response
    const formattedDeaths = myDeaths.map(death => ({
      id: death.id,
      level: death.level,
      type: death.type,
      killers: death.killers,
      timestamp: death.timestamp.toISOString(),
      description: death.description,
    }));

    return NextResponse.json(formattedDeaths);
  } catch (error) {
    console.error('My deaths error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch my deaths' },
      { status: 500 }
    );
  }
}


