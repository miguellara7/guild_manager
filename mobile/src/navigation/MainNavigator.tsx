import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { MainTabParamList } from '../types';
import DashboardNavigator from './DashboardNavigator';
import OnlineNavigator from './OnlineNavigator';
import MembersNavigator from './MembersNavigator';
import EnemiesNavigator from './EnemiesNavigator';
import DeathsNavigator from './DeathsNavigator';
import SettingsNavigator from './SettingsNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Online') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Members') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Enemies') {
            iconName = focused ? 'shield' : 'shield-outline';
          } else if (route.name === 'Deaths') {
            iconName = focused ? 'skull' : 'skull-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066cc',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardNavigator}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Online" 
        component={OnlineNavigator}
        options={{ title: 'Online' }}
      />
      <Tab.Screen 
        name="Members" 
        component={MembersNavigator}
        options={{ title: 'Members' }}
      />
      <Tab.Screen 
        name="Enemies" 
        component={EnemiesNavigator}
        options={{ title: 'Enemies' }}
      />
      <Tab.Screen 
        name="Deaths" 
        component={DeathsNavigator}
        options={{ title: 'Deaths' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsNavigator}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
