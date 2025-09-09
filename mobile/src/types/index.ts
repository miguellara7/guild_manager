export interface User {
  id: string;
  characterName: string;
  world: string;
  role: 'SUPER_ADMIN' | 'GUILD_ADMIN' | 'GUILD_MEMBER';
  guild?: Guild;
  subscription?: Subscription;
}

export interface Guild {
  id: string;
  name: string;
  world: string;
  type: 'MAIN' | 'FRIEND' | 'ENEMY';
  isMainGuild: boolean;
  description?: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  characterName: string;
  world: string;
  level: number;
  vocation: string;
  isOnline: boolean;
  lastLogin?: string;
  guild?: Guild;
  deaths: Death[];
}

export interface Death {
  id: string;
  playerId: string;
  level: number;
  killers: string[];
  reason: string;
  timestamp: string;
  type: 'PVP' | 'PVE' | 'ACCIDENT';
  player: Player;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  worldLimit: number;
  tibiaCoinsOption: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  expiresAt: string;
  amount: number;
  currency: string;
}

export interface OnlinePlayer {
  characterName: string;
  level: number;
  vocation: string;
  world: string;
  guild: string;
  guildType: 'MAIN' | 'FRIEND' | 'ENEMY';
  category?: 'bombs' | 'mains' | 'makers' | 'other';
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Online: undefined;
  Members: undefined;
  Enemies: undefined;
  Deaths: undefined;
  Settings: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
};

export type OnlineStackParamList = {
  OnlineList: undefined;
};

export type MembersStackParamList = {
  MembersList: undefined;
};

export type EnemiesStackParamList = {
  EnemiesList: undefined;
};

export type DeathsStackParamList = {
  DeathsList: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  GuildSettings: undefined;
  WorldSettings: undefined;
  Subscription: undefined;
};
