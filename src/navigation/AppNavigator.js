// AppNavigator.js — Root navigator, controls auth vs app flow
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../services/supabase';
import { requestPermissionAndGetToken, setupTokenRefreshListener } from '../services/fcmService';
import { startNotificationScheduler } from '../services/notificationScheduler';
import { colors } from '../constants/theme';
import CaptureScreen from '../screens/CaptureScreen';
// Auth Screens
import AuthGateScreen from '../screens/auth/AuthGateScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Onboarding Screens
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NameScreen from '../screens/onboarding/NameScreen';
import WakeScreen from '../screens/onboarding/WakeScreen';
import TimezoneScreen from '../screens/onboarding/TimezoneScreen';
import ReadyScreen from '../screens/onboarding/ReadyScreen';


// App Screens
import HomeScreen from '../screens/HomeScreen';
import MainTabs from './MainTabs';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    requestPermissionAndGetToken();

    const unsubRefresh = setupTokenRefreshListener();
    const stopScheduler = startNotificationScheduler();

    return () => {
      unsubRefresh();
      stopScheduler();
    };
  }, [session]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      {session ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Capture" component={CaptureScreen} options={{ presentation: 'transparentModal', headerShown: false }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Name" component={NameScreen} />
          <Stack.Screen name="Wake" component={WakeScreen} />
          <Stack.Screen name="Timezone" component={TimezoneScreen} />
          <Stack.Screen name="Ready" component={ReadyScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="AuthGate" component={AuthGateScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Name" component={NameScreen} />
          <Stack.Screen name="Wake" component={WakeScreen} />
          <Stack.Screen name="Timezone" component={TimezoneScreen} />
          <Stack.Screen name="Ready" component={ReadyScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}