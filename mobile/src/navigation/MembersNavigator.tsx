import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { MembersStackParamList } from '../types';
import MembersScreen from '../screens/members/MembersScreen';

const Stack = createStackNavigator<MembersStackParamList>();

const MembersNavigator: React.FC = () => {
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
        name="MembersList" 
        component={MembersScreen}
        options={{ title: 'Guild Members' }}
      />
    </Stack.Navigator>
  );
};

export default MembersNavigator;
