import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { authService } from '../../services/auth';
import { SettingsStackParamList } from '../../types';

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'SettingsHome'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();

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
          },
        },
      ]
    );
  };

  const SettingsItem: React.FC<{
    title: string;
    subtitle?: string;
    icon: string;
    onPress: () => void;
    color?: string;
  }> = ({ title, subtitle, icon, onPress, color = '#0066cc' }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon as any} size={24} color={color} />
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Guild Management</Text>
        
        <SettingsItem
          title="Guild Settings"
          subtitle="Manage guild configurations"
          icon="people"
          onPress={() => navigation.navigate('GuildSettings')}
        />
        
        <SettingsItem
          title="World Settings"
          subtitle="Configure monitored worlds"
          icon="globe"
          onPress={() => navigation.navigate('WorldSettings')}
        />

        <Text style={styles.sectionTitle}>Account</Text>
        
        <SettingsItem
          title="Subscription"
          subtitle="Manage your plan and billing"
          icon="card"
          onPress={() => navigation.navigate('Subscription' as any)}
        />
        
        <SettingsItem
          title="Profile"
          subtitle="View your character info"
          icon="person"
          onPress={() => Alert.alert('Info', 'Profile management coming soon')}
        />
        
        <SettingsItem
          title="Notifications"
          subtitle="Death and online alerts"
          icon="notifications"
          onPress={() => Alert.alert('Info', 'Notification settings coming soon')}
        />

        <Text style={styles.sectionTitle}>Support</Text>
        
        <SettingsItem
          title="Help & FAQ"
          subtitle="Get help and answers"
          icon="help-circle"
          onPress={() => Alert.alert('Info', 'Help section coming soon')}
        />
        
        <SettingsItem
          title="Contact Support"
          subtitle="Get in touch with us"
          icon="mail"
          onPress={() => Alert.alert('Info', 'Contact support coming soon')}
        />

        <View style={styles.dangerZone}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <SettingsItem
            title="Logout"
            subtitle="Sign out of your account"
            icon="log-out"
            onPress={handleLogout}
            color="#cc0066"
          />
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
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  settingsItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    marginLeft: 16,
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dangerZone: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default SettingsScreen;
