// src/screens/onboarding/WakeScreen.js
// Screen 3 of 5 — Capture user's personal wake phrase
// Voice is mocked for now — real Whisper API wired in U06

import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  TextInput, StyleSheet
} from 'react-native';
import { colors, typography, spacing, radius } from '../../constants/theme';

const EXAMPLES = ['Hey Keepr', 'Yo K', 'OK Boss', 'Let\'s go'];

export default function WakeScreen({ navigation, route }) {
  const { name } = route.params;
  const [phrase, setPhrase] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    if (phrase.trim().length === 0) return;
    setConfirmed(true);
  }

  function handleReRecord() {
    setPhrase('');
    setConfirmed(false);
  }

  function handleNext() {
    navigation.navigate('Timezone', { name, wakePhrase: phrase.trim() });
  }

  return (
    <View style={styles.container}>

      {/* Progress */}
      <View style={styles.progressRow}>
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotDone]} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.label}>STEP 2 OF 3</Text>
        <Text style={styles.headline}>Choose your{'\n'}wake phrase</Text>
        <Text style={styles.subtext}>
          This is how you'll activate Keepr by voice.{'\n'}
          Make it short and natural — max 5 words.
        </Text>

        {/* Examples */}
        <Text style={styles.examplesLabel}>Examples:</Text>
        <View style={styles.examplesRow}>
          {EXAMPLES.map((ex) => (
            <TouchableOpacity
              key={ex}
              style={styles.exampleChip}
              onPress={() => { setPhrase(ex); setConfirmed(false); }}
            >
              <Text style={styles.exampleText}>{ex}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mic button — mocked until U06 */}
        <TouchableOpacity style={styles.micButton} onPress={() => {}}>
          <Text style={styles.micIcon}>🎙️</Text>
          <Text style={styles.micLabel}>Tap to speak your phrase</Text>
        </TouchableOpacity>

        {/* Text input */}
        {!confirmed ? (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Or type your wake phrase"
              placeholderTextColor={colors.textSecondary}
              value={phrase}
              onChangeText={setPhrase}
              autoCapitalize="words"
              maxLength={40}
            />
            <TouchableOpacity
              style={[styles.confirmBtn, phrase.trim().length === 0 && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={phrase.trim().length === 0}
            >
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.confirmedBox}>
            <Text style={styles.confirmedPhrase}>"{phrase}"</Text>
            <TouchableOpacity onPress={handleReRecord}>
              <Text style={styles.reRecord}>Change</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Next button */}
      <TouchableOpacity
        style={[styles.button, !confirmed && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!confirmed}
      >
        <Text style={styles.buttonText}>Next</Text>
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
    marginBottom: spacing.lg,
  },
  examplesLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  examplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  exampleChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  exampleText: {
    fontSize: typography.size.sm,
    color: colors.primary,
  },
  micButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  micIcon: {
    fontSize: typography.size.xl,
  },
  micLabel: {
    fontSize: typography.size.md,
    color: colors.accent,
    fontWeight: typography.weight.medium,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: colors.border,
  },
  confirmBtnText: {
    color: colors.surface,
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.sm,
  },
  confirmedBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmedPhrase: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
  },
  reRecord: {
    fontSize: typography.size.sm,
    color: colors.accent,
    fontWeight: typography.weight.medium,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    color: colors.surface,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  },
});