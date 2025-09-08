import { User, Guild, Player, Death, AlertRule, Subscription, PaymentVerification } from "@prisma/client";

// Extend Prisma types with relations
export interface UserWithRelations extends User {
  guild?: GuildWithRelations;
  subscription?: Subscription;
  alertRules?: AlertRule[];
  paymentVerifications?: PaymentVerification[];
}

export interface GuildWithRelations extends Guild {
  players?: {
    id: string;
    name: string;
    level: number;
    vocation: string;
    type: string;
    isOnline: boolean;
    lastSeen: Date | null;
  }[];
  users?: {
    id: string;
    characterName: string;
    role: string;
    lastLoginAt: Date | null;
  }[];
  alertRules?: AlertRule[];
  parentGuild?: Guild;
  academyGuilds?: Guild[];
}

export interface PlayerWithRelations extends Player {
  guild?: Guild;
  deaths?: Death[];
}

export interface DeathWithRelations extends Death {
  player: Player;
}

// Authentication types
export interface LoginCredentials {
  characterName: string;
  guildPassword: string;
  world: string;
}

export interface AuthUser {
  id: string;
  characterName: string;
  world: string;
  role: string;
  guildId?: string;
}

// TibiaData API types
export interface TibiaCharacter {
  character: {
    name: string;
    level: number;
    vocation: string;
    world: string;
    residence: string;
    guild?: {
      name: string;
      rank: string;
    };
    last_login: {
      date: string;
      timezone: string;
      timezone_type: number;
    };
    account_status: string;
    achievements?: {
      name: string;
      grade: number;
    }[];
    deaths?: {
      date: string;
      level: number;
      killers: Array<{
        name: string;
        player: boolean;
        traded: boolean;
        summon: string;
      }>;
      reason: string;
    }[];
  };
}

export interface TibiaGuild {
  guild: {
    name: string;
    world: string;
    founded: string;
    active: boolean;
    applications: boolean;
    war: boolean;
    players_online: number;
    players_offline: number;
    members: Array<{
      name: string;
      title: string;
      rank: string;
      vocation: string;
      level: number;
      joined: string;
      status: string;
    }>;
    invited: Array<{
      name: string;
      date: string;
    }>;
  };
}

export interface TibiaWorld {
  world: {
    name: string;
    status: string;
    players_online: number;
    record_players: number;
    record_date: string;
    creation_date: string;
    location: string;
    pvp_type: string;
    premium_only: boolean;
    transfer_type: string;
    world_quest_titles: string[];
    battleye_protected: boolean;
    battleye_date: string;
    game_world_type: string;
    tournament_world_type: string;
  };
  players: {
    online: Array<{
      name: string;
      level: number;
      vocation: string;
    }>;
  };
}

// Alert system types
export interface AlertCondition {
  type: 'enemies_online' | 'level_range' | 'deaths' | 'custom';
  threshold: number;
  timeWindow: number; // minutes
  levelMin?: number;
  levelMax?: number;
  customLogic?: string;
}

export interface AlertContext {
  onlineEnemies: Player[];
  recentDeaths: Death[];
  guildMembers: Player[];
  timestamp: Date;
}

// Notification types
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'death' | 'alert' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  metadata?: Record<string, unknown>;
}

// WebSocket event types
export interface SocketEvents {
  // Client to server
  'join-guild': { guildId: string };
  'leave-guild': { guildId: string };
  'subscribe-player': { playerId: string };
  'unsubscribe-player': { playerId: string };
  
  // Server to client
  'player-online': { player: Player };
  'player-offline': { player: Player };
  'player-death': { death: DeathWithRelations };
  'alert-triggered': { alert: AlertRule; context: AlertContext };
  'notification': { notification: NotificationData };
  'guild-updated': { guild: GuildWithRelations };
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Subscription types
export interface SubscriptionLimits {
  worldLimit: number;
  playersPerWorld: number;
  alertsLimit: number;
  apiCallsPerDay: number;
}

export interface PaymentData {
  amount: number;
  currency: string;
  tibiaCoins?: number;
  paymentMethod: 'tibia_coins' | 'stripe';
  subscriptionId: string;
}

// Dashboard types
export interface DashboardStats {
  totalPlayers: number;
  onlinePlayers: number;
  onlineEnemies: number;
  recentDeaths: number;
  alertsTriggered: number;
  subscriptionStatus: string;
  worldsMonitored: number;
}

// Search and filter types
export interface PlayerFilters {
  world?: string;
  guild?: string;
  type?: 'guild_member' | 'external_friend' | 'external_enemy';
  isOnline?: boolean;
  levelMin?: number;
  levelMax?: number;
  vocation?: string;
}

export interface DeathFilters {
  playerId?: string;
  type?: 'pvp' | 'pve';
  dateFrom?: Date;
  dateTo?: Date;
  levelMin?: number;
  levelMax?: number;
}

// Cache types
export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  expiresAt: Date;
  createdAt: Date;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

// Error types
export class TibiaDataError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'TibiaDataError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class SubscriptionError extends Error {
  constructor(message: string, public subscriptionId?: string) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}
