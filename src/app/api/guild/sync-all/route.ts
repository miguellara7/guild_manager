import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-simple';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;

    // Get all guild configurations for this user
    const worldSubscriptions = await prisma.worldSubscription.findMany({
      where: { 
        userId: user.id,
        isActive: true,
      },
      include: {
        guildConfigurations: {
          where: { isActive: true },
          include: {
            guild: {
              select: {
                id: true,
                name: true,
                world: true,
                type: true,
                lastSyncAt: true
              }
            }
          }
        }
      }
    });

    const allGuilds = worldSubscriptions.flatMap(ws => 
      ws.guildConfigurations.map(gc => gc.guild)
    );

    if (allGuilds.length === 0) {
      return NextResponse.json({ 
        message: 'No guilds configured to sync',
        syncResults: []
      });
    }

    console.log(`🔄 Starting sync for ${allGuilds.length} guilds for user: ${user.name}`);

    const syncResults = [];

    // Sync each guild
    for (const guild of allGuilds) {
      try {
        // Call the sync-players endpoint
        const syncResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/guild/sync-players`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('Cookie') || '', // Pass along session
          },
          body: JSON.stringify({ guildId: guild.id })
        });

        const syncResult = await syncResponse.json();

        syncResults.push({
          guildId: guild.id,
          guildName: guild.name,
          world: guild.world,
          type: guild.type,
          success: syncResponse.ok,
          ...syncResult
        });

        if (syncResponse.ok) {
          console.log(`✅ Synced ${guild.name}: ${syncResult.syncedCount} new, ${syncResult.updatedCount} updated`);
        } else {
          console.error(`❌ Failed to sync ${guild.name}:`, syncResult.error);
        }

      } catch (error) {
        console.error(`❌ Error syncing guild ${guild.name}:`, error);
        syncResults.push({
          guildId: guild.id,
          guildName: guild.name,
          world: guild.world,
          type: guild.type,
          success: false,
          error: 'Sync request failed'
        });
      }

      // Add a small delay between syncs to be respectful to TibiaData API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = syncResults.filter(r => r.success).length;
    const failureCount = syncResults.length - successCount;

    console.log(`🎉 Sync completed: ${successCount} successful, ${failureCount} failed`);

    return NextResponse.json({
      message: `Sync completed: ${successCount}/${syncResults.length} guilds synced successfully`,
      totalGuilds: syncResults.length,
      successCount,
      failureCount,
      syncResults
    });

  } catch (error) {
    console.error('Bulk guild sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync guilds' },
      { status: 500 }
    );
  }
}

