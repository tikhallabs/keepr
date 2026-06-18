// App.js — Keepr Entry Point
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { registerBackgroundHandler } from './src/services/fcmService';
import { initNotifee } from './src/services/notificationScheduler';

registerBackgroundHandler();

export default function App() {
  useEffect(() => {
    initNotifee();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#FAFAFA" />
      <AppNavigator />
    </NavigationContainer>
  );
}