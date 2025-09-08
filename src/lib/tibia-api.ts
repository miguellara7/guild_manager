// TibiaData API v4 integration
const TIBIADATA_BASE_URL = 'https://api.tibiadata.com/v4';

export interface TibiaGuild {
  name: string;
  logo_url: string;
  description: string;
}

export interface TibiaGuildsResponse {
  guilds: {
    world: string;
    active: TibiaGuild[];
    formation: null; // Formation guilds (usually null)
  };
  information: {
    api: {
      version: number;
      release: string;
      commit: string;
    };
    timestamp: string;
    tibia_urls: string[];
    status: {
      http_code: number;
    };
  };
}

export interface TibiaCharacter {
  name: string;
  level: number;
  vocation: string;
  world: string;
  residence: string;
  guild?: {
    name: string;
    rank: string;
  };
  last_login: string;
  account_status: string;
  status: string;
}

export interface TibiaCharacterResponse {
  character: TibiaCharacter;
  information: {
    api: {
      version: number;
      release: string;
      commit: string;
    };
    timestamp: string;
    status: {
      http_code: number;
    };
  };
}

/**
 * Fetch all active guilds for a specific world
 */
export async function fetchWorldGuilds(world: string): Promise<TibiaGuild[]> {
  try {
    const response = await fetch(`${TIBIADATA_BASE_URL}/guilds/${encodeURIComponent(world)}`, {
      headers: {
        'User-Agent': 'TibiaGuildManager/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`TibiaData API error: ${response.status}`);
    }

    const data: TibiaGuildsResponse = await response.json();
    
    if (data.information.status.http_code !== 200) {
      throw new Error(`TibiaData API returned status: ${data.information.status.http_code}`);
    }

    return data.guilds.active || [];
  } catch (error) {
    console.error('Error fetching guilds from TibiaData:', error);
    throw error;
  }
}

/**
 * Fetch character information
 */
export async function fetchCharacterInfo(characterName: string): Promise<TibiaCharacter | null> {
  try {
    const response = await fetch(`${TIBIADATA_BASE_URL}/character/${encodeURIComponent(characterName)}`, {
      headers: {
        'User-Agent': 'TibiaGuildManager/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`TibiaData API error: ${response.status}`);
    }

    const data: TibiaCharacterResponse = await response.json();
    
    if (data.information.status.http_code !== 200) {
      return null; // Character not found
    }

    return data.character;
  } catch (error) {
    console.error('Error fetching character from TibiaData:', error);
    return null;
  }
}

/**
 * Search guilds by name pattern in a specific world
 */
export async function searchGuildsByName(world: string, searchQuery: string): Promise<TibiaGuild[]> {
  try {
    const allGuilds = await fetchWorldGuilds(world);
    
    // Filter guilds by search query (case insensitive)
    const filteredGuilds = allGuilds.filter(guild => 
      guild.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filteredGuilds;
  } catch (error) {
    console.error('Error searching guilds:', error);
    return [];
  }
}

/**
 * Validate if a world exists by trying to fetch its guilds
 */
export async function validateWorld(world: string): Promise<boolean> {
  try {
    await fetchWorldGuilds(world);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get guild member count and basic info
 */
export async function getGuildBasicInfo(guildName: string, world: string) {
  try {
    const guilds = await fetchWorldGuilds(world);
    const guild = guilds.find(g => g.name === guildName);
    
    if (!guild) {
      return null;
    }

    return {
      name: guild.name,
      world: world,
      description: guild.description,
      logo_url: guild.logo_url,
      memberCount: 0, // Would need guild details API call
      playerCount: 0, // Would need guild details API call
    };
  } catch (error) {
    console.error('Error getting guild info:', error);
    return null;
  }
}

export interface TibiaGuildMember {
  name: string;
  title: string;
  rank: string;
  vocation: string;
  level: number;
  joined: string;
  status: string; // 'online' or 'offline'
}

export interface TibiaGuildDetails {
  name: string;
  world: string;
  logo_url: string;
  description: string;
  guildhalls: Array<{
    name: string;
    world: string;
    paid_until: string;
  }>;
  active: boolean;
  founded: string;
  open_applications: boolean;
  homepage: string;
  in_war: boolean;
  disband_date: string;
  disband_condition: string;
  players_online: number;
  players_offline: number;
  members_total: number;
  members_invited: number;
  members: TibiaGuildMember[];
}

export interface TibiaGuildResponse {
  guild: TibiaGuildDetails;
  information: {
    api: {
      version: number;
      release: string;
      commit: string;
    };
    timestamp: string;
    tibia_urls: string[];
    status: {
      http_code: number;
    };
  };
}

/**
 * Get detailed guild information including all members
 */
export async function getGuildMembers(guildName: string): Promise<TibiaGuildDetails | null> {
  try {
    const url = `${TIBIADATA_BASE_URL}/guild/${encodeURIComponent(guildName)}`;
    console.log(`🔍 Fetching guild data from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TibiaGuildManager/1.0',
      },
    });

    console.log(`📡 TibiaData API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ TibiaData API error for guild "${guildName}":`, {
        status: response.status,
        statusText: response.statusText,
        url,
        errorBody: errorText
      });
      throw new Error(`TibiaData API error: ${response.status} - ${response.statusText}`);
    }

    const data: TibiaGuildResponse = await response.json();
    
    if (data.information.status.http_code !== 200 || !data.guild) {
      return null;
    }

    return data.guild;
  } catch (error) {
    console.error('Error fetching guild members:', error);
    return null;
  }
}
