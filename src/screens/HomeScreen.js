// HomeScreen.js — Temporary placeholder for post-login landing
// Full Morning Briefing comes in U13
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { supabase } from '../services/supabase';

export default function HomeScreen({ navigation }) {

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're in.</Text>
      <Text style={styles.subtitle}>
        Home screen coming in U13 — Morning Briefing.
      </Text>

      {/* Capture Button */}
      <TouchableOpacity
        style={styles.captureButton}
        onPress={() => navigation.navigate('Capture')}
      >
        <Text style={styles.captureButtonText}>+ Capture</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Floating Mic Button */}
      <TouchableOpacity style={styles.micButton} onPress={() => navigation.navigate('Capture')}>
        <Text style={styles.micIcon}>🎙️</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  captureButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  captureButtonText: {
    color: colors.surface,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
  signOutButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  signOutText: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
  },
  micButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  micIcon: {
    fontSize: 24,
  },
});