// App.js — Keepr Entry Point
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#FAFAFA" />
      <AppNavigator />
    </NavigationContainer>
  );
}