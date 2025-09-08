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

    // Get all guild members with their player data
    const guildMembers = await prisma.user.findMany({
      where: {
        guildId: user.guildId,
      },
      include: {
        guild: {
          select: {
            name: true,
            world: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // Guild admin first
        { characterName: 'asc' },
      ],
    });

    // Get player data for each member
    const membersWithPlayerData = await Promise.all(
      guildMembers.map(async (member) => {
        // Find corresponding player record
        const player = await prisma.player.findFirst({
          where: {
            name: member.characterName,
            guildId: user.guildId,
          },
        });

        // Count recent deaths (last 24 hours)
        const deaths24h = await prisma.death.count({
          where: {
            player: {
              name: member.characterName,
              guildId: user.guildId,
            },
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        });

        return {
          id: member.id,
          characterName: member.characterName,
          level: player?.level || 0,
          vocation: player?.vocation || 'Unknown',
          status: player?.isOnline ? 'online' : 'offline',
          lastSeen: player?.lastSeen?.toISOString() || member.lastLoginAt?.toISOString() || member.updatedAt.toISOString(),
          joinDate: member.createdAt.toISOString(),
          role: member.role,
          deaths24h,
          isActive: member.isActive,
        };
      })
    );

    return NextResponse.json(membersWithPlayerData);
  } catch (error) {
    console.error('Guild members error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guild members' },
      { status: 500 }
    );
  }
}


