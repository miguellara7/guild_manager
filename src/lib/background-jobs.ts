import { deathTrackerService } from '@/services/death-tracker';
import { tibiaDataService } from '@/services/tibia-api';
import { prisma } from '@/lib/db';

class BackgroundJobManager {
  private jobs: Map<string, NodeJS.Timeout> = new Map();
  private isInitialized = false;

  /**
   * Initialize all background jobs
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Background jobs already initialized');
      return;
    }

    console.log('Initializing background jobs...');

    try {
      // Start death tracking service
      await deathTrackerService.start();

      // Start online status monitoring
      this.startOnlineStatusMonitoring();

      // Start cache cleanup
      this.startCacheCleanup();

      // Start health checks
      this.startHealthChecks();

      this.isInitialized = true;
      console.log('Background jobs initialized successfully');
    } catch (error) {
      console.error('Failed to initialize background jobs:', error);
      throw error;
    }
  }

  /**
   * Monitor online status of tracked players
   */
  private startOnlineStatusMonitoring(): void {
    const jobId = 'online-status-monitor';
    
    const job = setInterval(async () => {
      try {
        await this.updateOnlineStatus();
      } catch (error) {
        console.error('Online status monitoring error:', error);
      }
    }, 60000); // Every minute

    this.jobs.set(jobId, job);
    console.log('Started online status monitoring');
  }

  /**
   * Update online status for all tracked players
   */
  private async updateOnlineStatus(): Promise<void> {
    const worlds = await prisma.guild.findMany({
      where: { isActive: true },
      select: { world: true },
      distinct: ['world'],
    });

    for (const { world } of worlds) {
      try {
        // Get online players from TibiaData
        const onlinePlayers = await tibiaDataService.getOnlinePlayers(world);
        const onlineNames = new Set(onlinePlayers.map(p => p.name.toLowerCase()));

        // Update all players in this world
        await prisma.player.updateMany({
          where: { world },
          data: { isOnline: false },
        });

        if (onlineNames.size > 0) {
          // Update online players
          await prisma.player.updateMany({
            where: {
              world,
              name: {
                in: Array.from(onlineNames),
                mode: 'insensitive',
              },
            },
            data: {
              isOnline: true,
              lastSeen: new Date(),
            },
          });

          // Log online history
          const onlinePlayerRecords = await prisma.player.findMany({
            where: {
              world,
              name: {
                in: Array.from(onlineNames),
                mode: 'insensitive',
              },
            },
            select: { id: true, level: true },
          });

          if (onlinePlayerRecords.length > 0) {
            await prisma.onlineHistory.createMany({
              data: onlinePlayerRecords.map(player => ({
                playerId: player.id,
                isOnline: true,
                level: player.level,
                timestamp: new Date(),
              })),
              skipDuplicates: true,
            });
          }
        }

        console.log(`Updated online status for ${onlineNames.size} players in ${world}`);
      } catch (error) {
        console.error(`Error updating online status for world ${world}:`, error);
      }
    }
  }

  /**
   * Clean up old cache entries and data
   */
  private startCacheCleanup(): void {
    const jobId = 'cache-cleanup';
    
    const job = setInterval(async () => {
      try {
        await this.cleanupOldData();
      } catch (error) {
        console.error('Cache cleanup error:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    this.jobs.set(jobId, job);
    console.log('Started cache cleanup job');
  }

  /**
   * Clean up old data and cache entries
   */
  private async cleanupOldData(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
      // Clean up old TibiaData cache entries
      await prisma.tibiaDataCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      // Clean up old online history (keep last 7 days)
      await prisma.onlineHistory.deleteMany({
        where: {
          timestamp: {
            lt: sevenDaysAgo,
          },
        },
      });

      // Clean up old notifications (keep last 30 days)
      await prisma.notification.deleteMany({
        where: {
          sentAt: {
            lt: thirtyDaysAgo,
          },
          read: true,
        },
      });

      // Clean up old API usage logs (keep last 30 days)
      await prisma.apiUsage.deleteMany({
        where: {
          timestamp: {
            lt: thirtyDaysAgo,
          },
        },
      });

      console.log('Completed data cleanup');
    } catch (error) {
      console.error('Error during data cleanup:', error);
    }
  }

  /**
   * Perform health checks on services
   */
  private startHealthChecks(): void {
    const jobId = 'health-checks';
    
    const job = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        console.error('Health check error:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    this.jobs.set(jobId, job);
    console.log('Started health check job');
  }

  /**
   * Perform health checks on various services
   */
  private async performHealthChecks(): Promise<void> {
    const checks = {
      database: false,
      tibiaDataApi: false,
      deathTracker: false,
    };

    try {
      // Database health check
      await prisma.$queryRaw`SELECT 1`;
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    try {
      // TibiaData API health check
      checks.tibiaDataApi = await tibiaDataService.healthCheck();
    } catch (error) {
      console.error('TibiaData API health check failed:', error);
    }

    try {
      // Death tracker health check
      const status = deathTrackerService.getStatus();
      checks.deathTracker = status.isRunning;
    } catch (error) {
      console.error('Death tracker health check failed:', error);
    }

    // Log health status
    const healthyServices = Object.values(checks).filter(Boolean).length;
    const totalServices = Object.keys(checks).length;
    
    console.log(`Health check: ${healthyServices}/${totalServices} services healthy`, checks);

    // Restart services if needed
    if (!checks.deathTracker) {
      console.log('Restarting death tracker service...');
      try {
        await deathTrackerService.start();
      } catch (error) {
        console.error('Failed to restart death tracker:', error);
      }
    }
  }

  /**
   * Sync guild data with TibiaData
   */
  async syncGuildData(guildId: string): Promise<void> {
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
    });

    if (!guild) {
      throw new Error('Guild not found');
    }

    try {
      const guildData = await tibiaDataService.getGuild(guild.name, guild.world);
      
      if (!guildData.guild) {
        throw new Error('Guild not found in TibiaData');
      }

      // Update guild members
      const members = guildData.guild.members || [];
      
      for (const member of members) {
        await prisma.player.upsert({
          where: {
            name_world: {
              name: member.name,
              world: guild.world,
            },
          },
          update: {
            level: member.level,
            vocation: member.vocation,
            guildId: guild.id,
            type: 'GUILD_MEMBER',
          },
          create: {
            name: member.name,
            world: guild.world,
            level: member.level,
            vocation: member.vocation,
            guildId: guild.id,
            type: 'GUILD_MEMBER',
          },
        });
      }

      // Update guild sync timestamp
      await prisma.guild.update({
        where: { id: guildId },
        data: { lastSyncAt: new Date() },
      });

      console.log(`Synced ${members.length} members for guild ${guild.name}`);
    } catch (error) {
      console.error(`Failed to sync guild ${guild.name}:`, error);
      throw error;
    }
  }

  /**
   * Stop all background jobs
   */
  stop(): void {
    console.log('Stopping background jobs...');

    // Stop death tracker
    deathTrackerService.stop();

    // Stop all interval jobs
    for (const [jobId, job] of this.jobs) {
      clearInterval(job);
      console.log(`Stopped job: ${jobId}`);
    }

    this.jobs.clear();
    this.isInitialized = false;
    console.log('All background jobs stopped');
  }

  /**
   * Get status of all jobs
   */
  getStatus(): Record<string, any> {
    return {
      isInitialized: this.isInitialized,
      activeJobs: Array.from(this.jobs.keys()),
      deathTracker: deathTrackerService.getStatus(),
    };
  }
}

// Export singleton instance
export const backgroundJobManager = new BackgroundJobManager();
export default backgroundJobManager;
