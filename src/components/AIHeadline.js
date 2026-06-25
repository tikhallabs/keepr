// AIHeadline.js — GPT-generated executive summary card (D024, D025)
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

export default function AIHeadline({ headline, loading, hasItems }) {
  if (loading) {
    return (
      <View style={[styles.card, styles.row]}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.loadingText}>Reading your commitments…</Text>
      </View>
    );
  }

  if (!hasItems || !headline) {
    return (
      <View style={[styles.card, styles.clearCard]}>
        <Text style={styles.clearText}>
          You're clear — nothing overdue or due today.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>TODAY'S FOCUS</Text>
      <Text style={styles.headline}>{headline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clearCard: {
    borderColor: colors.success,
    backgroundColor: '#F0FDF4',
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.accent,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  headline: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.primary,
    lineHeight: 24,
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  clearText: {
    fontSize: typography.size.md,
    color: colors.success,
    fontWeight: typography.weight.medium,
  },
});
