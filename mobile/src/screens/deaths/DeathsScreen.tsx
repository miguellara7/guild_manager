import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../../services/api';
import { Death } from '../../types';

const DeathsScreen: React.FC = () => {
  const [deaths, setDeaths] = useState<Death[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDeaths();
  }, []);

  const loadDeaths = async () => {
    try {
      const data = await apiService.getRecentDeaths();
      setDeaths(data);
    } catch (error) {
      console.error('Error loading deaths:', error);
      Alert.alert('Error', 'Failed to load death data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDeaths();
  };

  const getDeathTypeColor = (type: string) => {
    switch (type) {
      case 'PVP': return '#cc0066';
      case 'PVE': return '#ff6600';
      case 'ACCIDENT': return '#666';
      default: return '#999';
    }
  };

  const renderDeath = ({ item }: { item: Death }) => (
    <View style={styles.deathCard}>
      <View style={styles.deathHeader}>
        <Text style={styles.playerName}>{item.player.characterName}</Text>
        <View style={[styles.typeBadge, { backgroundColor: getDeathTypeColor(item.type) }]}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>
      
      <View style={styles.deathInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="trending-up" size={14} color="#666" />
          <Text style={styles.infoText}>Level {item.level}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.infoText}>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.reason}>{item.reason}</Text>
      
      {item.killers.length > 0 && (
        <View style={styles.killersContainer}>
          <Text style={styles.killersLabel}>Killers:</Text>
          <Text style={styles.killers}>{item.killers.join(', ')}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Death Tracking</Text>
        <Text style={styles.subtitle}>Monitor recent deaths</Text>
      </View>

      <FlatList
        data={deaths}
        renderItem={renderDeath}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="skull-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No recent deaths</Text>
            <Text style={styles.emptySubtitle}>Pull to refresh</Text>
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
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  deathCard: {
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
  deathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  deathInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  reason: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  killersContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  killersLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  killers: {
    fontSize: 14,
    color: '#333',
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
  },
});

export default DeathsScreen;
