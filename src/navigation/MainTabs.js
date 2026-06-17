// MainTabs.js — Bottom tab bar: Home, Queue, Ideas + persistent floating mic (D006)
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import QueueScreen from '../screens/QueueScreen';
import IdeasScreen from '../screens/IdeasScreen';
import FloatingMicButton from '../components/FloatingMicButton';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: 'home',
  Queue: 'list',
  Ideas: 'bulb',
};

export default function MainTabs() {
  return (
    <View style={styles.wrapper}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={ICONS[route.name]} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Queue" component={QueueScreen} />
        <Tab.Screen name="Ideas" component={IdeasScreen} />
      </Tab.Navigator>
      <FloatingMicButton />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});