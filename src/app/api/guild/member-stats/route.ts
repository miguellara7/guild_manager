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

    // Get member-specific stats
    const [
      guildMembersOnline,
      enemiesOnline,
      myRecentDeaths,
      guildRecentDeaths,
    ] = await Promise.all([
      // Guild members online
      prisma.player.count({
        where: {
          guildId: user.guildId,
          type: 'GUILD_MEMBER',
          isOnline: true,
        },
      }),
      // Enemies online in the same world
      prisma.player.count({
        where: {
          world: guild.world,
          type: 'EXTERNAL_ENEMY',
          isOnline: true,
        },
      }),
      // My deaths in the last 7 days
      prisma.death.count({
        where: {
          player: {
            name: user.characterName, // Assuming player name matches character name
            guildId: user.guildId,
          },
          timestamp: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      // Guild deaths today
      prisma.death.count({
        where: {
          player: {
            guildId: user.guildId,
          },
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
          },
        },
      }),
    ]);

    const memberStats = {
      guildMembersOnline,
      enemiesOnline,
      myRecentDeaths,
      guildRecentDeaths,
    };

    return NextResponse.json(memberStats);
  } catch (error) {
    console.error('Member stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member stats' },
      { status: 500 }
    );
  }
}


