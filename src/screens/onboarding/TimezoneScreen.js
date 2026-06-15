// src/screens/onboarding/TimezoneScreen.js
// Screen 4 of 5 — Confirm timezone, auto-detected from device

import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet
} from 'react-native';
import { colors, typography, spacing, radius } from '../../constants/theme';

export default function TimezoneScreen({ navigation, route }) {
  const { name, wakePhrase } = route.params;
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    // Auto-detect timezone from device
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(tz);
  }, []);

  function handleNext() {
    navigation.navigate('Ready', { name, wakePhrase, timezone });
  }

  return (
    <View style={styles.container}>

      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.label}>STEP 3 OF 3</Text>
        <Text style={styles.headline}>Your timezone</Text>
        <Text style={styles.subtext}>
          We detected this from your device.{'\n'}
          Keepr uses this for scheduling and briefings.
        </Text>

        {/* Timezone display */}
        <View style={styles.timezoneBox}>
          <Text style={styles.timezoneIcon}>🌍</Text>
          <View>
            <Text style={styles.timezoneValue}>{timezone}</Text>
            <Text style={styles.timezoneHint}>Detected from your device</Text>
          </View>
        </View>

        <Text style={styles.changeNote}>
          If this is wrong, you can change it in Settings after setup.
        </Text>
      </View>

      {/* Confirm button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Confirm Timezone</Text>
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
    color: colors.accent,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  headline: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    lineHeight: 38,
    marginBottom: spacing.md,
  },
  subtext: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  timezoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  timezoneIcon: {
    fontSize: typography.size.xxl,
  },
  timezoneValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
  },
  timezoneHint: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  changeNote: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    lineHeight: 20,
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