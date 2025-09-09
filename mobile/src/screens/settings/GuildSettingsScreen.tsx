import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../../services/api';

interface GuildConfig {
  id: string;
  guild: {
    id: string;
    name: string;
    world: string;
  };
  type: 'MAIN' | 'FRIEND' | 'ENEMY';
  priority: number;
  isActive: boolean;
}

const GuildSettingsScreen: React.FC = () => {
  const [guildConfigs, setGuildConfigs] = useState<GuildConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGuildConfigs();
  }, []);

  const loadGuildConfigs = async () => {
    try {
      const data = await apiService.getGuildConfigurations();
      setGuildConfigs(data);
    } catch (error) {
      console.error('Error loading guild configs:', error);
      Alert.alert('Error', 'Failed to load guild configurations');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGuildConfigs();
  };

  const handleSync = async () => {
    try {
      await apiService.syncAllGuilds();
      Alert.alert('Success', 'Guild sync completed');
      loadGuildConfigs();
    } catch (error) {
      console.error('Error syncing guilds:', error);
      Alert.alert('Error', 'Failed to sync guilds');
    }
  };

  const handleDeleteGuild = (guildConfig: GuildConfig) => {
    Alert.alert(
      'Delete Guild',
      `Are you sure you want to remove ${guildConfig.guild.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteGuildConfiguration(guildConfig.id);
              Alert.alert('Success', 'Guild removed successfully');
              loadGuildConfigs();
            } catch (error) {
              console.error('Error deleting guild:', error);
              Alert.alert('Error', 'Failed to remove guild');
            }
          },
        },
      ]
    );
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MAIN': return '#0066cc';
      case 'FRIEND': return '#00cc66';
      case 'ENEMY': return '#cc0066';
      default: return '#666';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MAIN': return 'Main Guild';
      case 'FRIEND': return 'Allied';
      case 'ENEMY': return 'Enemy';
      default: return 'Unknown';
    }
  };

  const renderGuildConfig = (guildConfig: GuildConfig) => (
    <View key={guildConfig.id} style={styles.guildCard}>
      <View style={styles.guildHeader}>
        <View style={styles.guildInfo}>
          <Text style={styles.guildName}>{guildConfig.guild.name}</Text>
          <Text style={styles.guildWorld}>{guildConfig.guild.world}</Text>
        </View>
        <View style={styles.guildActions}>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(guildConfig.type) }]}>
            <Text style={styles.typeText}>{getTypeLabel(guildConfig.type)}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteGuild(guildConfig)}
          >
            <Ionicons name="trash-outline" size={20} color="#cc0066" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.guildMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="flag-outline" size={14} color="#666" />
          <Text style={styles.metaText}>Priority: {guildConfig.priority}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons 
            name={guildConfig.isActive ? "checkmark-circle" : "close-circle"} 
            size={14} 
            color={guildConfig.isActive ? "#00cc66" : "#cc0066"} 
          />
          <Text style={styles.metaText}>
            {guildConfig.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading guild settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Guild Settings</Text>
          <Text style={styles.subtitle}>Manage your guild configurations</Text>
        </View>
        <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
          <Ionicons name="sync" size={20} color="#0066cc" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{guildConfigs.length}</Text>
            <Text style={styles.statLabel}>Total Guilds</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#00cc66' }]}>
              {guildConfigs.filter(g => g.type === 'FRIEND').length}
            </Text>
            <Text style={styles.statLabel}>Allied</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#cc0066' }]}>
              {guildConfigs.filter(g => g.type === 'ENEMY').length}
            </Text>
            <Text style={styles.statLabel}>Enemies</Text>
          </View>
        </View>

        <View style={styles.guildsList}>
          <Text style={styles.sectionTitle}>Configured Guilds</Text>
          {guildConfigs.map(renderGuildConfig)}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color="#0066cc" />
          <Text style={styles.addButtonText}>Add New Guild</Text>
          <Text style={styles.addButtonSubtext}>Available in web version</Text>
        </TouchableOpacity>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  syncButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  guildsList: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  guildCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guildHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guildInfo: {
    flex: 1,
  },
  guildName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  guildWorld: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  guildActions: {
    alignItems: 'flex-end',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 4,
  },
  guildMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#f0f8ff',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
    marginTop: 8,
  },
  addButtonSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default GuildSettingsScreen;
