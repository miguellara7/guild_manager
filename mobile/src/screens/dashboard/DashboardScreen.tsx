import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../../services/api';
import { authService } from '../../services/auth';
import { User } from '../../types';

interface DashboardStats {
  totalMembers: number;
  onlineMembers: number;
  totalEnemies: number;
  onlineEnemies: number;
  recentDeaths: number;
  highThreats: number;
}

const DashboardScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [userData, dashboardStats] = await Promise.all([
        authService.getUser(),
        apiService.getDashboardStats(),
      ]);

      setUser(userData);
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            // Navigation will be handled automatically by AppNavigator
          },
        },
      ]
    );
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: string;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.characterName}>{user?.characterName}</Text>
          <Text style={styles.worldText}>{user?.world}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Guild Overview</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Members"
            value={stats?.totalMembers || 0}
            icon="people"
            color="#0066cc"
            subtitle="Guild members"
          />
          
          <StatCard
            title="Online Now"
            value={stats?.onlineMembers || 0}
            icon="person"
            color="#00cc66"
            subtitle="Currently online"
          />
        </View>

        <Text style={styles.sectionTitle}>Enemy Tracking</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Enemies"
            value={stats?.totalEnemies || 0}
            icon="shield"
            color="#cc6600"
            subtitle="Tracked enemies"
          />
          
          <StatCard
            title="Online Enemies"
            value={stats?.onlineEnemies || 0}
            icon="warning"
            color="#cc0066"
            subtitle="Currently online"
          />
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            title="Recent Deaths"
            value={stats?.recentDeaths || 0}
            icon="skull"
            color="#990000"
            subtitle="Last 24 hours"
          />
          
          <StatCard
            title="High Threats"
            value={stats?.highThreats || 0}
            icon="alert-circle"
            color="#ff6600"
            subtitle="Level 400+"
          />
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Linking.openURL('http://74.208.149.168:3000/purchase')}
          >
            <Ionicons name="card" size={20} color="#00cc66" />
            <Text style={[styles.actionButtonText, { color: '#00cc66' }]}>Purchase Subscription</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={async () => {
              try {
                await apiService.syncAllGuilds();
                Alert.alert('Success', 'Guild sync completed');
                loadDashboardData();
              } catch (error) {
                Alert.alert('Error', 'Failed to sync guilds');
              }
            }}
          >
            <Ionicons name="sync" size={20} color="#0066cc" />
            <Text style={styles.actionButtonText}>Sync All Guilds</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Info', 'Notification settings available in Settings tab')}
          >
            <Ionicons name="notifications" size={20} color="#0066cc" />
            <Text style={styles.actionButtonText}>Death Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color="#ccc" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  worldText: {
    fontSize: 14,
    color: '#999',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 0.48,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  quickActions: {
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default DashboardScreen;
