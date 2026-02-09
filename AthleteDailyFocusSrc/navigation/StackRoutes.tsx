import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabsNavigation from './TabsNavigation';
import WelcomeScreen from '../screens/WelcomeScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import AthleteLoader from '../components/AthleteLoader';

export type StackList = {
  WelcomeScreen: undefined;
  TabsNavigation: undefined;
  RegistrationScreen: undefined;
  MyProfileScreen: undefined;
  AthleteLoader: undefined;
};

const Stack = createStackNavigator<StackList>();

const StackRoutes: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AthleteLoader" component={AthleteLoader} />
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} />
      <Stack.Screen name="TabsNavigation" component={TabsNavigation} />
      <Stack.Screen name="MyProfileScreen" component={MyProfileScreen} />
    </Stack.Navigator>
  );
};

export default StackRoutes;
