// BriefingList.js — Overdue / Due Today / Needs Attention sections for Morning Briefing
import { View, Text, TouchableOpacity, SectionList, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function RecordRow({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(item)} activeOpacity={0.7}>
      <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
      {item.due_date ? (
        <Text style={styles.rowDate}>{formatDate(item.due_date)}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const SECTIONS_CONFIG = [
  { key: 'overdue',       title: 'Overdue',          accent: colors.error },
  { key: 'dueToday',      title: 'Due Today',         accent: colors.accent },
  { key: 'needsAttention',title: 'Needs Attention',   accent: colors.textSecondary },
];

export default function BriefingList({ overdue, dueToday, needsAttention, onItemPress }) {
  const dataMap = { overdue, dueToday, needsAttention };

  const sections = SECTIONS_CONFIG
    .map((cfg) => ({ ...cfg, data: dataMap[cfg.key] }))
    .filter((s) => s.data.length > 0);

  if (sections.length === 0) return null;

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      scrollEnabled={false}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: section.accent }]} />
          <Text style={[styles.sectionTitle, { color: section.accent }]}>
            {section.title} ({section.data.length})
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <RecordRow item={item} onPress={onItemPress} />
      )}
      renderSectionFooter={() => <View style={styles.sectionGap} />}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.5,
  },
  sectionGap: {
    height: spacing.sm,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowTitle: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  rowDate: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    flexShrink: 0,
  },
});
