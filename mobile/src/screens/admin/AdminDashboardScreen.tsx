import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../../services/api';

interface PaymentTicket {
  id: string;
  userId: string;
  characterName: string;
  world: string;
  plan: 'BASIC' | 'EXTENDED';
  amount: number;
  additionalWorlds: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  transferDetails: {
    fromCharacter: string;
    toCharacter: string;
    timestamp: string;
    screenshot?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BusinessMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  pendingPayments: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

const AdminDashboardScreen: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [pendingTickets, setPendingTickets] = useState<PaymentTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [metricsData, ticketsData] = await Promise.all([
        apiService.getBusinessMetrics(),
        apiService.getPendingPaymentTickets(),
      ]);

      setMetrics(metricsData);
      setPendingTickets(ticketsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin dashboard data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  const handleApprovePayment = async (ticketId: string) => {
    Alert.alert(
      'Approve Payment',
      'Are you sure you want to approve this payment? This will activate the subscription.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              await apiService.approvePaymentTicket(ticketId);
              Alert.alert('Success', 'Payment approved and subscription activated');
              loadAdminData();
            } catch (error) {
              console.error('Error approving payment:', error);
              Alert.alert('Error', 'Failed to approve payment');
            }
          },
        },
      ]
    );
  };

  const handleRejectPayment = async (ticketId: string) => {
    Alert.alert(
      'Reject Payment',
      'Are you sure you want to reject this payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.rejectPaymentTicket(ticketId);
              Alert.alert('Success', 'Payment rejected');
              loadAdminData();
            } catch (error) {
              console.error('Error rejecting payment:', error);
              Alert.alert('Error', 'Failed to reject payment');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#ff6600';
      case 'APPROVED': return '#00cc66';
      case 'REJECTED': return '#cc0066';
      default: return '#666';
    }
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderTicket = ({ item }: { item: PaymentTicket }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketCharacter}>{item.characterName}</Text>
          <Text style={styles.ticketWorld}>{item.world}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.ticketDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Plan:</Text>
          <Text style={styles.detailValue}>{item.plan}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>{item.amount} TC</Text>
        </View>
        {item.additionalWorlds > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Additional Worlds:</Text>
            <Text style={styles.detailValue}>{item.additionalWorlds}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>From Character:</Text>
          <Text style={styles.detailValue}>{item.transferDetails.fromCharacter}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>To Character:</Text>
          <Text style={styles.detailValue}>{item.transferDetails.toCharacter}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created:</Text>
          <Text style={styles.detailValue}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {item.status === 'PENDING' && (
        <View style={styles.ticketActions}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApprovePayment(item.id)}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleRejectPayment(item.id)}
          >
            <Ionicons name="close-circle" size={20} color="white" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading admin dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Business metrics and payment management</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Business Metrics</Text>
        
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Users"
            value={metrics?.totalUsers || 0}
            icon="people"
            color="#0066cc"
          />
          
          <MetricCard
            title="Active Subscriptions"
            value={metrics?.activeSubscriptions || 0}
            icon="checkmark-circle"
            color="#00cc66"
          />
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="Pending Payments"
            value={metrics?.pendingPayments || 0}
            icon="time"
            color="#ff6600"
          />
          
          <MetricCard
            title="Monthly Revenue"
            value={`${metrics?.monthlyRevenue || 0} TC`}
            icon="trending-up"
            color="#9966cc"
          />
        </View>

        <View style={styles.pendingSection}>
          <Text style={styles.sectionTitle}>Pending Payment Tickets</Text>
          
          {pendingTickets.length > 0 ? (
            <FlatList
              data={pendingTickets}
              renderItem={renderTicket}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Pending Tickets</Text>
              <Text style={styles.emptySubtitle}>All payment tickets have been processed</Text>
            </View>
          )}
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
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 0.48,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  pendingSection: {
    marginTop: 8,
  },
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketCharacter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  ticketWorld: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
  ticketDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  ticketActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#00cc66',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#cc0066',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    backgroundColor: 'white',
    borderRadius: 12,
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

export default AdminDashboardScreen;
