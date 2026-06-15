// src/screens/onboarding/ReadyScreen.js
// Screen 5 of 5 — Setup complete, show summary, enter the app

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../../constants/theme';

export default function ReadyScreen({ navigation, route }) {
  const { name, wakePhrase, timezone } = route.params;

  function handleEnter() {
    // U04 will replace this with real navigation to Morning Briefing
    alert('Setup complete! Morning Briefing coming in U13.');
  }

  return (
    <View style={styles.container}>

      {/* Progress — all done */}
      <View style={styles.progressRow}>
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.label}>YOU'RE ALL SET</Text>
        <Text style={styles.headline}>Welcome to Keepr,{'\n'}{name}.</Text>
        <Text style={styles.subtext}>
          Here's what we've got for you:
        </Text>

        {/* Summary cards */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>👤</Text>
          <View>
            <Text style={styles.summaryLabel}>Your name</Text>
            <Text style={styles.summaryValue}>{name}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🎙️</Text>
          <View>
            <Text style={styles.summaryLabel}>Your wake phrase</Text>
            <Text style={styles.summaryValue}>"{wakePhrase}"</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryIcon}>🌍</Text>
          <View>
            <Text style={styles.summaryLabel}>Your timezone</Text>
            <Text style={styles.summaryValue}>{timezone}</Text>
          </View>
        </View>

        <Text style={styles.hint}>
          Say "{wakePhrase}" anywhere in the app to capture a commitment or idea instantly.
        </Text>
      </View>

      {/* Enter app */}
      <TouchableOpacity style={styles.button} onPress={handleEnter}>
        <Text style={styles.buttonText}>Enter Keepr →</Text>
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
  dotDone: {
    backgroundColor: colors.primary,
    width: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.success,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  headline: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  subtext: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryIcon: {
    fontSize: typography.size.xl,
  },
  summaryLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    fontWeight: typography.weight.medium,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
    marginTop: 2,
  },
  hint: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.surface,
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
  },
});