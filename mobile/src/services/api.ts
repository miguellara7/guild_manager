import { authService } from './auth';
import { OnlinePlayer, Player, Death, Guild } from '../types';

const API_BASE_URL = 'http://74.208.149.168:3000'; // Production server IP

class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.makeRequest('/api/dashboard/stats');
  }

  // Online monitoring APIs
  async getOnlinePlayers(): Promise<OnlinePlayer[]> {
    return this.makeRequest('/api/guild/online-monitoring');
  }

  // Members APIs
  async getGuildMembers(): Promise<Player[]> {
    return this.makeRequest('/api/guild/members');
  }

  // Enemies APIs
  async getEnemyPlayers(): Promise<Player[]> {
    return this.makeRequest('/api/guild/enemies');
  }

  // Deaths APIs
  async getRecentDeaths(): Promise<Death[]> {
    return this.makeRequest('/api/guild/deaths');
  }

  // Guild configuration APIs
  async getGuildConfigurations() {
    return this.makeRequest('/api/guild/guild-configurations');
  }

  async addGuildConfiguration(data: {
    world: string;
    guildName: string;
    type: 'MAIN' | 'FRIEND' | 'ENEMY';
  }) {
    return this.makeRequest('/api/guild/guild-configurations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteGuildConfiguration(id: string) {
    return this.makeRequest(`/api/guild/guild-configurations/${id}`, {
      method: 'DELETE',
    });
  }

  // World subscription APIs
  async getWorldSubscriptions() {
    return this.makeRequest('/api/guild/world-subscriptions');
  }

  async addWorldSubscription(data: {
    world: string;
    maxGuilds: number;
  }) {
    return this.makeRequest('/api/guild/world-subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteWorldSubscription(id: string) {
    return this.makeRequest(`/api/guild/world-subscriptions/${id}`, {
      method: 'DELETE',
    });
  }

  // Guild search API
  async searchGuilds(world: string, query: string): Promise<Guild[]> {
    const params = new URLSearchParams({
      world,
      query,
    });
    return this.makeRequest(`/api/guild/search-guilds?${params}`);
  }

  // Sync APIs
  async syncGuildPlayers(guildId: string) {
    return this.makeRequest('/api/guild/sync-players', {
      method: 'POST',
      body: JSON.stringify({ guildId }),
    });
  }

  async syncAllGuilds() {
    return this.makeRequest('/api/guild/sync-all', {
      method: 'POST',
    });
  }

  // Guild password API
  async updateGuildPassword(guildId: string, password: string) {
    return this.makeRequest('/api/guild/update-password', {
      method: 'POST',
      body: JSON.stringify({ guildId, password }),
    });
  }

  // World validation API
  async validateWorld(world: string) {
    return this.makeRequest('/api/guild/validate-world', {
      method: 'POST',
      body: JSON.stringify({ world }),
    });
  }

  // Subscription APIs
  async getSubscriptionStatus() {
    return this.makeRequest('/api/subscription/status');
  }

  async getSubscriptionPlans() {
    return this.makeRequest('/api/subscription/plans');
  }

  async submitPayment(data: {
    plan: string;
    amount: number;
    additionalWorlds?: number;
    transferDetails: {
      fromCharacter: string;
      toCharacter: string;
      timestamp: string;
      screenshot?: string;
    };
  }) {
    return this.makeRequest('/api/subscription/submit-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin APIs (Super Admin only)
  async getBusinessMetrics() {
    return this.makeRequest('/api/admin/business-metrics');
  }

  async getPendingPaymentTickets() {
    return this.makeRequest('/api/admin/pending-payments');
  }

  async approvePaymentTicket(ticketId: string) {
    return this.makeRequest('/api/admin/approve-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentId: ticketId }),
    });
  }

  async rejectPaymentTicket(ticketId: string) {
    return this.makeRequest('/api/admin/reject-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentId: ticketId }),
    });
  }
}

export const apiService = new ApiService();
