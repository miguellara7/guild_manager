import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { OnlineStackParamList } from '../types';
import OnlineScreen from '../screens/online/OnlineScreen';

const Stack = createStackNavigator<OnlineStackParamList>();

const OnlineNavigator: React.FC = () => {
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
        name="OnlineList" 
        component={OnlineScreen}
        options={{ title: 'Online Players' }}
      />
    </Stack.Navigator>
  );
};

export default OnlineNavigator;
