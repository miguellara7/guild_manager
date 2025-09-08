import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/db';
import { getGuildMembers } from '@/lib/tibia-api';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { guildId } = await request.json();

    if (!guildId) {
      return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 });
    }

    // Get guild from database
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { name: true, world: true, type: true }
    });

    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    console.log(`🔄 Syncing players for guild: ${guild.name} (${guild.world})`);

    // Fetch guild members from TibiaData API
    const guildData = await getGuildMembers(guild.name);

    if (!guildData) {
      return NextResponse.json({ 
        error: 'Failed to fetch guild data from TibiaData API' 
      }, { status: 404 });
    }

    // Verify world matches
    if (guildData.world !== guild.world) {
      return NextResponse.json({ 
        error: `Guild world mismatch. Expected: ${guild.world}, Got: ${guildData.world}` 
      }, { status: 400 });
    }

    let syncedCount = 0;
    let updatedCount = 0;

    // Sync each member
    for (const member of guildData.members) {
      try {
        // Normalize vocation names
        const normalizeVocation = (vocation: string): string => {
          const vocMap: { [key: string]: string } = {
            'Knight': 'Knight',
            'Elite Knight': 'Knight',
            'Paladin': 'Paladin', 
            'Royal Paladin': 'Paladin',
            'Sorcerer': 'Sorcerer',
            'Master Sorcerer': 'Sorcerer',
            'Druid': 'Druid',
            'Elder Druid': 'Druid',
            'Monk': 'Monk',
            'Exalted Monk': 'Monk'
          };
          return vocMap[vocation] || vocation;
        };

        const isOnline = member.status === 'online';
        const playerType = guild.type === 'ENEMY' ? 'EXTERNAL_ENEMY' : 'GUILD_MEMBER';

        const existingPlayer = await prisma.player.findUnique({
          where: {
            name_world: {
              name: member.name,
              world: guild.world
            }
          }
        });

        if (existingPlayer) {
          // Update existing player
          await prisma.player.update({
            where: {
              name_world: {
                name: member.name,
                world: guild.world
              }
            },
            data: {
              guildId: guildId,
              level: member.level,
              vocation: normalizeVocation(member.vocation),
              isOnline: isOnline,
              lastSeen: isOnline ? new Date() : existingPlayer.lastSeen,
              type: playerType,
              updatedAt: new Date()
            }
          });
          updatedCount++;
        } else {
          // Create new player
          await prisma.player.create({
            data: {
              name: member.name,
              world: guild.world,
              guildId: guildId,
              level: member.level,
              vocation: normalizeVocation(member.vocation),
              isOnline: isOnline,
              lastSeen: isOnline ? new Date() : new Date(Date.now() - 24 * 60 * 60 * 1000), // Default to 1 day ago if offline
              type: playerType
            }
          });
          syncedCount++;
        }
      } catch (playerError) {
        console.error(`Error syncing player ${member.name}:`, playerError);
        // Continue with other players
      }
    }

    // Update guild's last sync time
    await prisma.guild.update({
      where: { id: guildId },
      data: { 
        lastSyncAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log(`✅ Sync completed for ${guild.name}: ${syncedCount} new, ${updatedCount} updated`);

    return NextResponse.json({
      success: true,
      guildName: guild.name,
      totalMembers: guildData.members.length,
      syncedCount,
      updatedCount,
      onlineCount: guildData.players_online,
      offlineCount: guildData.players_offline
    });

  } catch (error) {
    console.error('Guild sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync guild players' },
      { status: 500 }
    );
  }
}

