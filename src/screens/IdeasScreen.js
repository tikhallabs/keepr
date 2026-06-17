// IdeasScreen.js — U11/U10: List of Ideas, with promotion to Commitment
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants/theme';

export default function IdeasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ideas</Text>
      <Text style={styles.subtitle}>List and promotion coming next.</Text>
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
  },
});