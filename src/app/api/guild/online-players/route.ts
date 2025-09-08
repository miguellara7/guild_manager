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

    // Get guild world
    const guild = await prisma.guild.findUnique({
      where: { id: user.guildId },
      select: { world: true },
    });

    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    // Get online players (guild members and enemies in the same world)
    const onlinePlayers = await prisma.player.findMany({
      where: {
        OR: [
          {
            guildId: user.guildId,
            type: 'GUILD_MEMBER',
            isOnline: true,
          },
          {
            world: guild.world,
            type: 'EXTERNAL_ENEMY',
            isOnline: true,
          },
        ],
      },
      select: {
        id: true,
        name: true,
        level: true,
        vocation: true,
        type: true,
        lastSeen: true,
        isOnline: true,
        guildId: true,
      },
      orderBy: [
        { type: 'asc' }, // Guild members first
        { level: 'desc' },
      ],
      take: 50, // Limit for performance
    });

    return NextResponse.json(onlinePlayers);
  } catch (error) {
    console.error('Online players error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch online players' },
      { status: 500 }
    );
  }
}


