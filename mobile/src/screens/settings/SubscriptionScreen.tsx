import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { apiService } from '../../services/api';
import { Subscription } from '../../types';

const SubscriptionScreen: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await apiService.getSubscriptionStatus();
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSubscription();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#00cc66';
      case 'EXPIRED': return '#cc0066';
      case 'PENDING': return '#ff6600';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'EXPIRED': return 'Expired';
      case 'PENDING': return 'Pending Approval';
      default: return 'Unknown';
    }
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Purchase Subscription',
      'You will be redirected to our website to create a purchase ticket and complete the payment process.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            Linking.openURL('http://74.208.149.168:3000/purchase');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading subscription...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Subscription</Text>
          <Text style={styles.subtitle}>Manage your guild monitoring plan</Text>
        </View>

        {subscription ? (
          <View style={styles.subscriptionCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{subscription.plan} Plan</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(subscription.status) }]}>
                <Text style={styles.statusText}>{getStatusText(subscription.status)}</Text>
              </View>
            </View>

            <View style={styles.planDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="globe-outline" size={16} color="#666" />
                <Text style={styles.detailText}>World Limit: {subscription.worldLimit}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {subscription.amount} {subscription.currency}
                </Text>
              </View>

              {subscription.expiresAt && (
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
              <Ionicons name="arrow-up-circle-outline" size={20} color="#0066cc" />
              <Text style={styles.upgradeButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noSubscriptionCard}>
            <Ionicons name="warning-outline" size={48} color="#ff6600" />
            <Text style={styles.noSubscriptionTitle}>No Active Subscription</Text>
            <Text style={styles.noSubscriptionText}>
              You need an active subscription to access guild monitoring features.
            </Text>
            <TouchableOpacity style={styles.subscribeButton} onPress={handleUpgrade}>
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Subscription Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
              <Text style={styles.featureText}>Real-time online monitoring</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
              <Text style={styles.featureText}>Death tracking and alerts</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
              <Text style={styles.featureText}>Enemy guild monitoring</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#00cc66" />
              <Text style={styles.featureText}>Multi-world support</Text>
            </View>
          </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
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
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  planDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#0066cc',
  },
  upgradeButtonText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '600',
    marginLeft: 8,
  },
  noSubscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noSubscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  noSubscriptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  subscribeButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  subscribeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default SubscriptionScreen;
