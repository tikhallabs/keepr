// IdeasScreen.js — U10: Idea list with tap-to-expand, full body, and Promote to Commitment
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { STATUS_META } from '../constants/statusMeta';
import { fetchRecords } from '../services/recordsService';
import { promoteIdeaToCommitment } from '../services/ideaService';
import { supabase } from '../services/supabase';

export default function IdeasScreen() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [actionBusyId, setActionBusyId] = useState(null);
  const [errorById, setErrorById] = useState({});

  const loadIdeas = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const all = await fetchRecords(user.id);
    const onlyIdeas = all.filter((r) => r.object_type === 'idea');
    setIdeas(onlyIdeas);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadIdeas();
      setLoading(false);
    })();
  }, [loadIdeas]);

  useFocusEffect(
    useCallback(() => {
      loadIdeas();
    }, [loadIdeas])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIdeas();
    setRefreshing(false);
  };

  const toggleExpand = (id) => {
    setExpandedId((curr) => (curr === id ? null : id));
  };

  const handlePromote = async (item) => {
    setActionBusyId(item.id);
    const { data: { user } } = await supabase.auth.getUser();
    const result = await promoteIdeaToCommitment(item.id, user.id);
    setActionBusyId(null);

    if (result.success) {
      setConfirmingId(null);
      setExpandedId(null);
      if (result.auditWarning) {
        setErrorById((prev) => ({ ...prev, [item.id]: result.auditWarning }));
      }
      await loadIdeas();
    } else {
      setErrorById((prev) => ({ ...prev, [item.id]: result.message || result.error || 'Unknown error' }));
    }
  };

  const renderItem = (item) => {
    const isExpanded = expandedId === item.id;
    const isBusy = actionBusyId === item.id;
    const isConverted = item.status === 'converted';

    return (
      <View key={item.id} style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <>
            <Text style={styles.cardBody}>{item.body}</Text>

            {isConverted ? (
              <View style={[styles.convertedFlag, { backgroundColor: STATUS_META.converted.bg }]}>
                <Text style={[styles.convertedFlagText, { color: STATUS_META.converted.color }]}>
                  {STATUS_META.converted.label}
                </Text>
              </View>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.promoteBtn}
                  disabled={isBusy}
                  onPress={() => setConfirmingId(item.id)}
                >
                  <Text style={styles.promoteBtnText}>Promote to Commitment</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {confirmingId === item.id && (
          <View style={styles.confirmPanel}>
            <Text style={styles.confirmText}>Promote this idea to a commitment?</Text>
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity style={styles.confirmNoBtn} onPress={() => setConfirmingId(null)}>
                <Text style={styles.confirmNoBtnText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmYesBtn} onPress={() => handlePromote(item)}>
                <Text style={styles.confirmYesBtnText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {errorById[item.id] && (
          <TouchableOpacity onPress={() => setErrorById((prev) => ({ ...prev, [item.id]: null }))}>
            <Text style={styles.inlineError}>{errorById[item.id]} (tap to dismiss)</Text>
          </TouchableOpacity>
        )}

        {isBusy && <ActivityIndicator style={{ marginTop: spacing.sm }} color={colors.primary} />}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ideas</Text>
      </View>

      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderItem(item)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No ideas yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md },
  headerTitle: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.surface },
  cardTitle: { fontSize: typography.size.md, fontWeight: typography.weight.medium, color: colors.textPrimary },
  cardBody: { fontSize: typography.size.sm, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  promoteBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, alignItems: 'center', backgroundColor: colors.border },
  promoteBtnText: { fontSize: typography.size.xs, fontWeight: typography.weight.medium, color: colors.textPrimary },
  convertedFlag: { alignSelf: 'flex-start', marginTop: spacing.md, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: 999 },
  convertedFlagText: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  confirmPanel: { marginTop: spacing.md, padding: spacing.sm, borderRadius: borderRadius.sm, backgroundColor: '#FFF8E8' },
  confirmText: { fontSize: typography.size.xs, color: colors.textPrimary, marginBottom: spacing.sm },
  confirmButtonRow: { flexDirection: 'row', gap: spacing.sm },
  confirmNoBtn: { flex: 1, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, alignItems: 'center', backgroundColor: colors.border },
  confirmNoBtnText: { fontSize: typography.size.xs, color: colors.textPrimary, fontWeight: typography.weight.medium },
  confirmYesBtn: { flex: 1, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, alignItems: 'center', backgroundColor: colors.primary },
  confirmYesBtnText: { fontSize: typography.size.xs, color: colors.surface, fontWeight: typography.weight.bold },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  inlineError: { fontSize: typography.size.xs, color: colors.error, marginTop: spacing.sm },
});