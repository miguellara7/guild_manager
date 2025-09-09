import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../../services/api';
import { OnlinePlayer } from '../../types';

const OnlineScreen: React.FC = () => {
  const [players, setPlayers] = useState<OnlinePlayer[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<OnlinePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Allies' | 'Enemies'>('All');

  useEffect(() => {
    loadOnlinePlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchQuery, selectedFilter]);

  const loadOnlinePlayers = async () => {
    try {
      const data = await apiService.getOnlinePlayers();
      setPlayers(data);
    } catch (error) {
      console.error('Error loading online players:', error);
      Alert.alert('Error', 'Failed to load online players');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const filterPlayers = () => {
    let filtered = players;

    // Filter by guild type
    if (selectedFilter === 'Allies') {
      filtered = filtered.filter(p => p.guildType === 'MAIN' || p.guildType === 'FRIEND');
    } else if (selectedFilter === 'Enemies') {
      filtered = filtered.filter(p => p.guildType === 'ENEMY');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.characterName.toLowerCase().includes(query) ||
        p.guild.toLowerCase().includes(query) ||
        p.vocation.toLowerCase().includes(query)
      );
    }

    // Sort by level (descending)
    filtered.sort((a, b) => b.level - a.level);

    setFilteredPlayers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOnlinePlayers();
  };

  const getVocationIcon = (vocation: string) => {
    switch (vocation.toLowerCase()) {
      case 'knight':
        return 'shield';
      case 'paladin':
        return 'bow';
      case 'sorcerer':
        return 'flame';
      case 'druid':
        return 'leaf';
      default:
        return 'person';
    }
  };

  const getVocationColor = (vocation: string) => {
    switch (vocation.toLowerCase()) {
      case 'knight':
        return '#8B4513';
      case 'paladin':
        return '#228B22';
      case 'sorcerer':
        return '#FF4500';
      case 'druid':
        return '#32CD32';
      default:
        return '#666';
    }
  };

  const getCategoryColor = (guildType: string) => {
    switch (guildType) {
      case 'MAIN':
        return '#0066cc';
      case 'FRIEND':
        return '#00cc66';
      case 'ENEMY':
        return '#cc0066';
      default:
        return '#666';
    }
  };

  const getCategoryLabel = (guildType: string) => {
    switch (guildType) {
      case 'MAIN':
        return 'Main Guild';
      case 'FRIEND':
        return 'Allied';
      case 'ENEMY':
        return 'Enemy';
      default:
        return 'Unknown';
    }
  };

  const renderPlayer = ({ item }: { item: OnlinePlayer }) => (
    <View style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.characterName}</Text>
          <View style={styles.playerMeta}>
            <Ionicons 
              name={getVocationIcon(item.vocation)} 
              size={14} 
              color={getVocationColor(item.vocation)} 
            />
            <Text style={[styles.vocation, { color: getVocationColor(item.vocation) }]}>
              {item.vocation}
            </Text>
            <Text style={styles.level}>Level {item.level}</Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.guildType) }]}>
          <Text style={styles.categoryText}>{getCategoryLabel(item.guildType)}</Text>
        </View>
      </View>
      
      <View style={styles.guildInfo}>
        <Ionicons name="people-outline" size={14} color="#666" />
        <Text style={styles.guildName}>{item.guild}</Text>
        <Text style={styles.worldName}>• {item.world}</Text>
      </View>

      {item.category && (
        <View style={styles.categoryInfo}>
          <Ionicons name="bookmark-outline" size={14} color="#0066cc" />
          <Text style={styles.categoryName}>{item.category}</Text>
        </View>
      )}
    </View>
  );

  const FilterButton: React.FC<{ 
    title: string; 
    isActive: boolean; 
    onPress: () => void;
    count: number;
  }> = ({ title, isActive, onPress, count }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {title} ({count})
      </Text>
    </TouchableOpacity>
  );

  const getFilterCount = (filter: string) => {
    switch (filter) {
      case 'All':
        return players.length;
      case 'Allies':
        return players.filter(p => p.guildType === 'MAIN' || p.guildType === 'FRIEND').length;
      case 'Enemies':
        return players.filter(p => p.guildType === 'ENEMY').length;
      default:
        return 0;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Online Monitoring</Text>
        <Text style={styles.subtitle}>Real-time player tracking</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search players or guilds..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <FilterButton
          title="All"
          isActive={selectedFilter === 'All'}
          onPress={() => setSelectedFilter('All')}
          count={getFilterCount('All')}
        />
        <FilterButton
          title="Allies"
          isActive={selectedFilter === 'Allies'}
          onPress={() => setSelectedFilter('Allies')}
          count={getFilterCount('Allies')}
        />
        <FilterButton
          title="Enemies"
          isActive={selectedFilter === 'Enemies'}
          onPress={() => setSelectedFilter('Enemies')}
          count={getFilterCount('Enemies')}
        />
      </View>

      <FlatList
        data={filteredPlayers}
        renderItem={renderPlayer}
        keyExtractor={(item) => `${item.characterName}-${item.world}`}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No players online</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search' : 'Pull to refresh'}
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
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vocation: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 8,
  },
  level: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  guildInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    color: '#0066cc',
    marginLeft: 4,
    fontWeight: '500',
    textTransform: 'capitalize',
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

export default OnlineScreen;
