import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../../services/api';
import { Player } from '../../types';

const MembersScreen: React.FC = () => {
  const [members, setMembers] = useState<Player[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery]);

  const loadMembers = async () => {
    try {
      const data = await apiService.getGuildMembers();
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
      Alert.alert('Error', 'Failed to load guild members');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const filterMembers = () => {
    let filtered = members;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.characterName.toLowerCase().includes(query) ||
        m.vocation.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => b.level - a.level);
    setFilteredMembers(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMembers();
  };

  const renderMember = ({ item }: { item: Player }) => (
    <View style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <Text style={styles.memberName}>{item.characterName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.isOnline ? '#00cc66' : '#ccc' }]}>
          <Text style={styles.statusText}>{item.isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>
      
      <View style={styles.memberInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="trending-up" size={16} color="#666" />
          <Text style={styles.infoText}>Level {item.level}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.infoText}>{item.vocation}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="skull" size={16} color="#666" />
          <Text style={styles.infoText}>{item.deaths?.length || 0} deaths</Text>
        </View>
      </View>

      {item.lastLogin && (
        <Text style={styles.lastLogin}>
          Last seen: {new Date(item.lastLogin).toLocaleDateString()}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Guild Members</Text>
        <Text style={styles.subtitle}>Manage and monitor your guild</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{members.length}</Text>
          <Text style={styles.statLabel}>Total Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{members.filter(m => m.isOnline).length}</Text>
          <Text style={styles.statLabel}>Online Now</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round(members.reduce((sum, m) => sum + m.level, 0) / members.length || 0)}
          </Text>
          <Text style={styles.statLabel}>Avg Level</Text>
        </View>
      </View>

      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No members found</Text>
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
  memberCard: {
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
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  memberInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  lastLogin: {
    fontSize: 12,
    color: '#999',
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

export default MembersScreen;
