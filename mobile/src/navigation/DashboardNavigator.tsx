import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { DashboardStackParamList } from '../types';
import DashboardScreen from '../screens/dashboard/DashboardScreen';

const Stack = createStackNavigator<DashboardStackParamList>();

const DashboardNavigator: React.FC = () => {
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
        name="DashboardHome" 
        component={DashboardScreen}
        options={{ title: 'Guild Dashboard' }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;
