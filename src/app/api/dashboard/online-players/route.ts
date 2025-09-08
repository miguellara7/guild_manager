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

    // Get online players (both guild members and enemies)
    const onlinePlayers = await prisma.player.findMany({
      where: {
        OR: [
          // Guild members
          {
            guildId: user.guildId,
            type: 'GUILD_MEMBER',
            isOnline: true,
          },
          // Enemies in the same world
          {
            world: user.world,
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
        guild: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: [
        { type: 'asc' }, // Guild members first
        { level: 'desc' }, // Then by level
      ],
      take: 50, // Limit to 50 players
    });

    return NextResponse.json(onlinePlayers);
  } catch (error) {
    console.error('Online players error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
