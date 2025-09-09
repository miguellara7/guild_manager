import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { EnemiesStackParamList } from '../types';
import EnemiesScreen from '../screens/enemies/EnemiesScreen';

const Stack = createStackNavigator<EnemiesStackParamList>();

const EnemiesNavigator: React.FC = () => {
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
        name="EnemiesList" 
        component={EnemiesScreen}
        options={{ title: 'Enemy Tracking' }}
      />
    </Stack.Navigator>
  );
};

export default EnemiesNavigator;
