import { prisma } from '@/lib/db';
import { tibiaDataService } from './tibia-api';
import { TibiaCharacter } from '@/types';

interface ProcessedDeath {
  playerId: string;
  timestamp: Date;
  level: number;
  killers: string[];
  description: string;
  type: 'PVP' | 'PVE';
}

class DeathTrackerService {
  private isRunning = false;
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * Start the death tracking service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Death tracker is already running');
      return;
    }

    console.log('Starting death tracker service...');
    this.isRunning = true;

    // Process deaths every 30 seconds
    this.processingInterval = setInterval(async () => {
      await this.processAllGuildDeaths();
    }, 30000);

    // Initial run
    await this.processAllGuildDeaths();
  }

  /**
   * Stop the death tracking service
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.isRunning = false;
    console.log('Death tracker service stopped');
  }

  /**
   * Process deaths for all active guilds
   */
  private async processAllGuildDeaths(): Promise<void> {
    try {
      const activeGuilds = await prisma.guild.findMany({
        where: { isActive: true },
        include: {
          players: {
            where: { type: 'GUILD_MEMBER' },
            select: { id: true, name: true, world: true },
          },
        },
      });

      for (const guild of activeGuilds) {
        await this.processGuildDeaths(guild.id, guild.players);
      }
    } catch (error) {
      console.error('Error processing guild deaths:', error);
    }
  }

  /**
   * Process deaths for a specific guild
   */
  private async processGuildDeaths(
    guildId: string,
    players: { id: string; name: string; world: string }[]
  ): Promise<void> {
    if (players.length === 0) return;

    try {
      // Group players by world for efficient processing
      const playersByWorld = players.reduce((acc, player) => {
        if (!acc[player.world]) {
          acc[player.world] = [];
        }
        acc[player.world].push(player);
        return acc;
      }, {} as Record<string, typeof players>);

      // Process each world
      for (const [world, worldPlayers] of Object.entries(playersByWorld)) {
        await this.processWorldDeaths(world, worldPlayers);
      }
    } catch (error) {
      console.error(`Error processing deaths for guild ${guildId}:`, error);
    }
  }

  /**
   * Process deaths for players in a specific world
   */
  private async processWorldDeaths(
    world: string,
    players: { id: string; name: string; world: string }[]
  ): Promise<void> {
    const playerNames = players.map(p => p.name);
    
    try {
      // Get character data for all players
      const characterData = await tibiaDataService.batchProcessCharacters(playerNames, 5);

      // Process deaths for each character
      for (const [playerName, character] of characterData) {
        const player = players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (!player || !character.character.deaths) continue;

        await this.processPlayerDeaths(player.id, character.character.deaths);
      }
    } catch (error) {
      console.error(`Error processing deaths for world ${world}:`, error);
    }
  }

  /**
   * Process deaths for a specific player
   */
  private async processPlayerDeaths(
    playerId: string,
    deaths: TibiaCharacter['character']['deaths']
  ): Promise<void> {
    if (!deaths || deaths.length === 0) return;

    try {
      // Get the last processed death timestamp for this player
      const lastProcessedDeath = await prisma.death.findFirst({
        where: { playerId },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      });

      const lastTimestamp = lastProcessedDeath?.timestamp || new Date(0);

      // Filter new deaths
      const newDeaths = deaths.filter(death => {
        const deathTime = new Date(death.date);
        return deathTime > lastTimestamp;
      });

      if (newDeaths.length === 0) return;

      // Process each new death
      const processedDeaths: ProcessedDeath[] = [];

      for (const death of newDeaths) {
        const processedDeath = this.processSingleDeath(playerId, death);
        if (processedDeath) {
          processedDeaths.push(processedDeath);
        }
      }

      // Save new deaths to database
      if (processedDeaths.length > 0) {
        await this.saveDeaths(processedDeaths);
        console.log(`Processed ${processedDeaths.length} new deaths for player ${playerId}`);
      }
    } catch (error) {
      console.error(`Error processing deaths for player ${playerId}:`, error);
    }
  }

  /**
   * Process a single death record
   */
  private processSingleDeath(
    playerId: string,
    death: any
  ): ProcessedDeath | null {
    try {
      const timestamp = new Date(death.date);
      const killers = death.killers.map((killer: any) => killer.name);
      const deathType = this.determineDeathType(death.killers);

      return {
        playerId,
        timestamp,
        level: death.level,
        killers,
        description: death.reason,
        type: deathType,
      };
    } catch (error) {
      console.error('Error processing single death:', error);
      return null;
    }
  }

  /**
   * Determine if death is PvP or PvE based on killers
   */
  private determineDeathType(killers: any[]): 'PVP' | 'PVE' {
    if (!killers || killers.length === 0) return 'PVE';

    // If any killer is a player (not a summon), it's PvP
    const hasPlayerKiller = killers.some(killer => killer.player && !killer.summon);
    return hasPlayerKiller ? 'PVP' : 'PVE';
  }

  /**
   * Save deaths to database
   */
  private async saveDeaths(deaths: ProcessedDeath[]): Promise<void> {
    try {
      await prisma.death.createMany({
        data: deaths.map(death => ({
          playerId: death.playerId,
          timestamp: death.timestamp,
          level: death.level,
          killers: death.killers,
          description: death.description,
          type: death.type,
          processed: true,
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      console.error('Error saving deaths to database:', error);
      throw error;
    }
  }

  /**
   * Get recent deaths for a guild
   */
  async getGuildDeaths(guildId: string, limit = 50): Promise<any[]> {
    return prisma.death.findMany({
      where: {
        player: { guildId },
      },
      include: {
        player: {
          select: {
            name: true,
            level: true,
            vocation: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Get PvP deaths for analysis
   */
  async getPvPDeaths(guildId: string, days = 7): Promise<any[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return prisma.death.findMany({
      where: {
        player: { guildId },
        type: 'PVP',
        timestamp: { gte: since },
      },
      include: {
        player: {
          select: {
            name: true,
            level: true,
            vocation: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Get death statistics for a guild
   */
  async getDeathStats(guildId: string, days = 30): Promise<any> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalDeaths, pvpDeaths, pveDeaths, deathsByLevel] = await Promise.all([
      prisma.death.count({
        where: {
          player: { guildId },
          timestamp: { gte: since },
        },
      }),
      prisma.death.count({
        where: {
          player: { guildId },
          type: 'PVP',
          timestamp: { gte: since },
        },
      }),
      prisma.death.count({
        where: {
          player: { guildId },
          type: 'PVE',
          timestamp: { gte: since },
        },
      }),
      prisma.death.groupBy({
        by: ['level'],
        where: {
          player: { guildId },
          timestamp: { gte: since },
        },
        _count: { id: true },
        orderBy: { level: 'desc' },
      }),
    ]);

    return {
      totalDeaths,
      pvpDeaths,
      pveDeaths,
      pvpPercentage: totalDeaths > 0 ? Math.round((pvpDeaths / totalDeaths) * 100) : 0,
      deathsByLevel: deathsByLevel.map(item => ({
        level: item.level,
        count: item._count.id,
      })),
    };
  }

  /**
   * Manual sync for a specific player
   */
  async syncPlayerDeaths(playerId: string): Promise<void> {
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      select: { name: true, world: true },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    const character = await tibiaDataService.getCharacter(player.name);
    if (character.character.deaths) {
      await this.processPlayerDeaths(playerId, character.character.deaths);
    }
  }

  /**
   * Get service status
   */
  getStatus(): { isRunning: boolean; lastCheck?: Date } {
    return {
      isRunning: this.isRunning,
      // Add last check timestamp if needed
    };
  }
}

// Export singleton instance
export const deathTrackerService = new DeathTrackerService();
export default deathTrackerService;
