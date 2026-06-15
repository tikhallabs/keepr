// src/screens/onboarding/WelcomeScreen.js
// Screen 1 of 5 — First thing a new user sees

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../constants/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>

      {/* Progress indicator */}
      <View style={styles.progressRow}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Text style={styles.label}>KEEPR</Text>
        <Text style={styles.headline}>Your Commitment{'\n'}Operating System</Text>
        <Text style={styles.subtext}>
          Let's set you up in 60 seconds.{'\n'}
          Three quick questions and you're in.
        </Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Name')}
      >
        <Text style={styles.buttonText}>Let's Begin</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xxl,
    justifyContent: 'space-between',
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.accent,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  headline: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    lineHeight: 40,
    marginBottom: spacing.lg,
  },
  subtext: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.surface,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});