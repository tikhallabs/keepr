// src/navigation/OnboardingNavigator.js
// Controls the flow between all 5 onboarding screens
// Forward only — no back button during setup

import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NameScreen from '../screens/onboarding/NameScreen';
import WakeScreen from '../screens/onboarding/WakeScreen';
import TimezoneScreen from '../screens/onboarding/TimezoneScreen';
import ReadyScreen from '../screens/onboarding/ReadyScreen';

const Stack = createStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,        // No default header — we build our own
        gestureEnabled: false,     // No swipe back during onboarding
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Wake" component={WakeScreen} />
      <Stack.Screen name="Timezone" component={TimezoneScreen} />
      <Stack.Screen name="Ready" component={ReadyScreen} />
    </Stack.Navigator>
  );
}