import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

const API_BASE_URL = 'http://74.208.149.168:3000'; // Production server IP

export interface LoginCredentials {
  characterName: string;
  world: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterName: credentials.characterName,
          world: credentials.world,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token securely
        if (data.token) {
          await SecureStore.setItemAsync(this.TOKEN_KEY, data.token);
        }
        
        // Store user data
        if (data.user) {
          await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
        }

        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
      await AsyncStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      const user = await this.getUser();
      return !!(token && user);
    } catch (error) {
      console.error('Check authentication error:', error);
      return false;
    }
  }

  async refreshUser(): Promise<User | null> {
    try {
      const token = await this.getToken();
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Refresh user error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
