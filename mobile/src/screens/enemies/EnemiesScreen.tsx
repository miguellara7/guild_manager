import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../../services/api';
import { Player } from '../../types';

const EnemiesScreen: React.FC = () => {
  const [enemies, setEnemies] = useState<Player[]>([]);
  const [filteredEnemies, setFilteredEnemies] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEnemies();
  }, []);

  useEffect(() => {
    filterEnemies();
  }, [enemies, searchQuery]);

  const loadEnemies = async () => {
    try {
      const data = await apiService.getEnemyPlayers();
      setEnemies(data);
    } catch (error) {
      console.error('Error loading enemies:', error);
      Alert.alert('Error', 'Failed to load enemy players');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const filterEnemies = () => {
    let filtered = enemies;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.characterName.toLowerCase().includes(query) ||
        e.vocation.toLowerCase().includes(query) ||
        e.guild?.name.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => b.level - a.level);
    setFilteredEnemies(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEnemies();
  };

  const handleSync = async () => {
    try {
      await apiService.syncAllGuilds();
      Alert.alert('Success', 'Guild sync completed');
      loadEnemies();
    } catch (error) {
      console.error('Error syncing guilds:', error);
      Alert.alert('Error', 'Failed to sync guilds');
    }
  };

  const getThreatLevel = (level: number) => {
    if (level >= 600) return { label: 'Extreme', color: '#cc0000' };
    if (level >= 400) return { label: 'High', color: '#ff6600' };
    if (level >= 200) return { label: 'Medium', color: '#ffcc00' };
    return { label: 'Low', color: '#00cc66' };
  };

  const renderEnemy = ({ item }: { item: Player }) => {
    const threat = getThreatLevel(item.level);
    
    return (
      <View style={styles.enemyCard}>
        <View style={styles.enemyHeader}>
          <View style={styles.enemyInfo}>
            <Text style={styles.enemyName}>{item.characterName}</Text>
            <View style={styles.enemyMeta}>
              <Text style={styles.level}>Level {item.level}</Text>
              <Text style={styles.vocation}>• {item.vocation}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: item.isOnline ? '#00cc66' : '#ccc' }]}>
              <Text style={styles.statusText}>{item.isOnline ? 'Online' : 'Offline'}</Text>
            </View>
            <View style={[styles.threatBadge, { backgroundColor: threat.color }]}>
              <Text style={styles.threatText}>{threat.label}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.guildInfo}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.guildName}>{item.guild?.name}</Text>
          <Text style={styles.worldName}>• {item.world}</Text>
        </View>

        <View style={styles.deathInfo}>
          <Ionicons name="skull-outline" size={14} color="#666" />
          <Text style={styles.deathText}>{item.deaths?.length || 0} recent deaths</Text>
          {item.lastLogin && (
            <Text style={styles.lastSeen}>
              Last seen: {new Date(item.lastLogin).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const onlineEnemies = enemies.filter(e => e.isOnline).length;
  const highThreats = enemies.filter(e => e.level >= 400).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Enemy Tracking</Text>
          <Text style={styles.subtitle}>Monitor enemy guilds and players</Text>
        </View>
        <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
          <Ionicons name="sync" size={20} color="#0066cc" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search enemies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{enemies.length}</Text>
          <Text style={styles.statLabel}>Total Enemies</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#cc0066' }]}>{onlineEnemies}</Text>
          <Text style={styles.statLabel}>Online Now</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#ff6600' }]}>{highThreats}</Text>
          <Text style={styles.statLabel}>High Threats</Text>
        </View>
      </View>

      <FlatList
        data={filteredEnemies}
        renderItem={renderEnemy}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No enemies found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Add enemy guilds in settings'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  enemyCard: {
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
  enemyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  enemyInfo: {
    flex: 1,
  },
  enemyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  enemyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  level: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  vocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  threatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  threatText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  guildInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guildName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  worldName: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
  },
  deathInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deathText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  lastSeen: {
    fontSize: 12,
    color: '#999',
    marginLeft: 'auto',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default EnemiesScreen;
