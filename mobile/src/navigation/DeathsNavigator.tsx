import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { DeathsStackParamList } from '../types';
import DeathsScreen from '../screens/deaths/DeathsScreen';

const Stack = createStackNavigator<DeathsStackParamList>();

const DeathsNavigator: React.FC = () => {
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
        name="DeathsList" 
        component={DeathsScreen}
        options={{ title: 'Death Tracking' }}
      />
    </Stack.Navigator>
  );
};

export default DeathsNavigator;
