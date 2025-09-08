import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TibiaCharacter, TibiaGuild, TibiaWorld, TibiaDataError, RateLimitInfo } from '@/types';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class TibiaDataService {
  private client: AxiosInstance;
  private cache = new Map<string, CacheEntry<any>>();
  private rateLimitInfo: RateLimitInfo = {
    limit: 60,
    remaining: 60,
    reset: new Date(Date.now() + 60000),
  };

  constructor() {
    this.client = axios.create({
      baseURL: process.env.TIBIADATA_API_URL || 'https://api.tibiadata.com/v4',
      timeout: 10000,
      headers: {
        'User-Agent': 'TibiaGuildManager/1.0',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.checkRateLimit();
      return config;
    });

    // Response interceptor for error handling and rate limit tracking
    this.client.interceptors.response.use(
      (response) => {
        this.updateRateLimitInfo(response);
        return response;
      },
      (error) => {
        if (error.response) {
          this.updateRateLimitInfo(error.response);
          
          // Handle specific error codes
          if (error.response.status === 429) {
            throw new TibiaDataError(
              'Rate limit exceeded',
              429,
              error.config?.url
            );
          }
          
          if (error.response.status >= 500) {
            throw new TibiaDataError(
              'TibiaData API server error',
              error.response.status,
              error.config?.url
            );
          }
        }
        
        throw new TibiaDataError(
          error.message || 'API request failed',
          error.response?.status,
          error.config?.url
        );
      }
    );
  }

  private async checkRateLimit(): Promise<void> {
    if (this.rateLimitInfo.remaining <= 0) {
      const waitTime = this.rateLimitInfo.reset.getTime() - Date.now();
      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  private updateRateLimitInfo(response: AxiosResponse): void {
    const headers = response.headers;
    
    if (headers['x-ratelimit-limit']) {
      this.rateLimitInfo.limit = parseInt(headers['x-ratelimit-limit']);
    }
    
    if (headers['x-ratelimit-remaining']) {
      this.rateLimitInfo.remaining = parseInt(headers['x-ratelimit-remaining']);
    }
    
    if (headers['x-ratelimit-reset']) {
      this.rateLimitInfo.reset = new Date(parseInt(headers['x-ratelimit-reset']) * 1000);
    }
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${endpoint}:${paramStr}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Get character information including deaths
   */
  async getCharacter(name: string, useCache = true): Promise<TibiaCharacter> {
    const cacheKey = this.getCacheKey('character', { name });
    
    if (useCache) {
      const cached = this.getFromCache<TibiaCharacter>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.client.get(`/character/${encodeURIComponent(name)}`);
      
      if (!response.data?.character) {
        throw new TibiaDataError(`Character '${name}' not found`, 404);
      }

      const characterData = response.data as TibiaCharacter;
      
      // Cache for 5 minutes
      this.setCache(cacheKey, characterData, 5 * 60 * 1000);
      
      return characterData;
    } catch (error) {
      if (error instanceof TibiaDataError) {
        throw error;
      }
      throw new TibiaDataError(`Failed to fetch character '${name}': ${error}`);
    }
  }

  /**
   * Get guild information with member list
   */
  async getGuild(name: string, world: string, useCache = true): Promise<TibiaGuild> {
    const cacheKey = this.getCacheKey('guild', { name, world });
    
    if (useCache) {
      const cached = this.getFromCache<TibiaGuild>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.client.get(
        `/guild/${encodeURIComponent(name)}/${encodeURIComponent(world)}`
      );
      
      if (!response.data?.guild) {
        throw new TibiaDataError(`Guild '${name}' not found in world '${world}'`, 404);
      }

      const guildData = response.data as TibiaGuild;
      
      // Cache for 10 minutes
      this.setCache(cacheKey, guildData, 10 * 60 * 1000);
      
      return guildData;
    } catch (error) {
      if (error instanceof TibiaDataError) {
        throw error;
      }
      throw new TibiaDataError(`Failed to fetch guild '${name}': ${error}`);
    }
  }

  /**
   * Get world information and online players
   */
  async getWorld(name: string, useCache = true): Promise<TibiaWorld> {
    const cacheKey = this.getCacheKey('world', { name });
    
    if (useCache) {
      const cached = this.getFromCache<TibiaWorld>(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await this.client.get(`/world/${encodeURIComponent(name)}`);
      
      if (!response.data?.world) {
        throw new TibiaDataError(`World '${name}' not found`, 404);
      }

      const worldData = response.data as TibiaWorld;
      
      // Cache for 1 minute (online data changes frequently)
      this.setCache(cacheKey, worldData, 60 * 1000);
      
      return worldData;
    } catch (error) {
      if (error instanceof TibiaDataError) {
        throw error;
      }
      throw new TibiaDataError(`Failed to fetch world '${name}': ${error}`);
    }
  }

  /**
   * Get recent deaths for a character
   */
  async getCharacterDeaths(name: string, limit = 20): Promise<TibiaCharacter['character']['deaths']> {
    const character = await this.getCharacter(name);
    const deaths = character.character.deaths || [];
    
    return deaths
      .slice(0, limit)
      .map(death => ({
        ...death,
        // Parse death type based on killers
        type: this.determineDeathType(death.killers),
      }));
  }

  /**
   * Determine if death is PvP or PvE based on killers
   */
  private determineDeathType(killers: unknown[]): 'pvp' | 'pve' {
    if (!killers || killers.length === 0) return 'pve';
    
    // If any killer is a player, it's PvP
    const hasPlayerKiller = killers.some(killer => killer.player);
    return hasPlayerKiller ? 'pvp' : 'pve';
  }

  /**
   * Get online players from a world
   */
  async getOnlinePlayers(world: string): Promise<TibiaWorld['players']['online']> {
    const worldData = await this.getWorld(world);
    return worldData.players.online || [];
  }

  /**
   * Batch process multiple characters with rate limiting
   */
  async batchProcessCharacters(names: string[], batchSize = 10): Promise<Map<string, TibiaCharacter>> {
    const results = new Map<string, TibiaCharacter>();
    const batches = this.chunkArray(names, batchSize);
    
    for (const batch of batches) {
      const promises = batch.map(async (name) => {
        try {
          const character = await this.getCharacter(name);
          results.set(name.toLowerCase(), character);
        } catch (error) {
          console.error(`Failed to fetch character ${name}:`, error);
          // Continue with other characters
        }
      });
      
      await Promise.allSettled(promises);
      
      // Add delay between batches to respect rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.rateLimitDelay();
      }
    }
    
    return results;
  }

  /**
   * Get deaths for multiple characters efficiently
   */
  async getBatchCharacterDeaths(names: string[]): Promise<Map<string, TibiaCharacter['character']['deaths']>> {
    const characters = await this.batchProcessCharacters(names);
    const deathsMap = new Map<string, TibiaCharacter['character']['deaths']>();
    
    for (const [name, character] of characters) {
      const deaths = character.character.deaths || [];
      deathsMap.set(name, deaths);
    }
    
    return deathsMap;
  }

  /**
   * Check if players are online by comparing with world data
   */
  async checkPlayersOnlineStatus(names: string[], world: string): Promise<Map<string, boolean>> {
    const onlinePlayers = await this.getOnlinePlayers(world);
    const onlineSet = new Set(onlinePlayers.map(p => p.name.toLowerCase()));
    
    const statusMap = new Map<string, boolean>();
    for (const name of names) {
      statusMap.set(name.toLowerCase(), onlineSet.has(name.toLowerCase()));
    }
    
    return statusMap;
  }

  /**
   * Utility method to chunk arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Add delay for rate limiting
   */
  private async rateLimitDelay(): Promise<void> {
    const delayMs = Math.max(1000, Math.ceil(60000 / (this.rateLimitInfo.limit || 60)));
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get current rate limit status
   */
  getRateLimitInfo(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  /**
   * Health check for the API
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to fetch a known world
      await this.getWorld('Antica', false);
      return true;
    } catch (error) {
      console.error('TibiaData API health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const tibiaDataService = new TibiaDataService();
export default tibiaDataService;
