import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { SettingsStackParamList } from '../types';
import SettingsScreen from '../screens/settings/SettingsScreen';
import GuildSettingsScreen from '../screens/settings/GuildSettingsScreen';
import WorldSettingsScreen from '../screens/settings/WorldSettingsScreen';
import SubscriptionScreen from '../screens/settings/SubscriptionScreen';

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0066cc',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="SettingsHome" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="GuildSettings" 
        component={GuildSettingsScreen}
        options={{ title: 'Guild Settings' }}
      />
      <Stack.Screen 
        name="WorldSettings" 
        component={WorldSettingsScreen}
        options={{ title: 'World Settings' }}
      />
      <Stack.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
