// QueueScreen.js — U11: Sorted/Stacked views + expandable actions (Reschedule, Complete, Cancel)
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { STATUS_META, STATUS_ORDER } from '../constants/statusMeta';
import { fetchRecords } from '../services/recordsService';
import { transitionRecord, rescheduleRecord } from '../services/lifecycleService';
import { understandCapture } from '../services/aiService';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { supabase } from '../services/supabase';

const OPEN_STATUSES = ['incomplete', 'unscheduled', 'scheduled', 'overdue'];

// D016 — days remaining before auto-cancel, counting down from 7
function getDaysLeftText(closureWarningStartedAt) {
  const startedMs = new Date(closureWarningStartedAt).getTime();
  const elapsedDays = (Date.now() - startedMs) / (1000 * 60 * 60 * 24);
  const daysLeft = Math.max(0, Math.ceil(7 - elapsedDays));
  if (daysLeft <= 0) return 'Cancelling today';
  if (daysLeft === 1) return '1 day left to cancel';
  return `${daysLeft} days left to cancel`;
}

export default function QueueScreen() {
  const [viewMode, setViewMode] = useState('stacked');
  const [activeFilter, setActiveFilter] = useState('all');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [actionBusyId, setActionBusyId] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [errorById, setErrorById] = useState({});
  const [warningById, setWarningById] = useState({});

  const recordsRef = useRef(records);
  const reschedulingIdRef = useRef(reschedulingId);
  useEffect(() => { recordsRef.current = records; }, [records]);
  useEffect(() => { reschedulingIdRef.current = reschedulingId; }, [reschedulingId]);

  const loadRecords = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const all = await fetchRecords(user.id);
    const open = all.filter(
      (r) => r.object_type === 'commitment' && OPEN_STATUSES.includes(r.status)
    );
    setRecords(open);
  }, []);

 useEffect(() => {
    (async () => {
      setLoading(true);
      await loadRecords();
      setLoading(false);
    })();
  }, [loadRecords]);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  };

  const toggleExpand = (id) => {
    setExpandedId((curr) => (curr === id ? null : id));
    setReschedulingId(null);
  };

  const getQuickPickDate = (type) => {
    const now = new Date();
    const d = new Date(now);
    if (type === 'later_today') return new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
    if (type === 'tomorrow') { d.setDate(d.getDate() + 1); d.setHours(11, 0, 0, 0); return d.toISOString(); }
    if (type === 'next_week') { d.setDate(d.getDate() + 7); d.setHours(11, 0, 0, 0); return d.toISOString(); }
  };

  const applyReschedule = async (item, newDueDateIso) => {
    setActionBusyId(item.id);
    const result = await rescheduleRecord(item.id, item.status, newDueDateIso);
    setActionBusyId(null);

     if (result.success) {
      setReschedulingId(null);
      setExpandedId(null);
      if (result.warning) {
        setWarningById((prev) => ({ ...prev, [item.id]: result.warning }));
      }
      await loadRecords();
    } else if (result.finalWarning) {
      setReschedulingId(null);
      setWarningById((prev) => ({ ...prev, [item.id]: result.message }));
      await loadRecords();
    } else {
      setErrorById((prev) => ({ ...prev, [item.id]: result.message || result.error || 'Unknown error' }));
    }
  };

  const { isRecording, isTranscribing, handleMicPress } = useVoiceRecorder(async (transcribedText) => {
    const id = reschedulingIdRef.current;
    const item = recordsRef.current.find((r) => r.id === id);
    if (!item) return;
    const aiResult = await understandCapture(transcribedText);
    if (aiResult.due_date) {
      applyReschedule(item, aiResult.due_date);
    } else {
      setErrorById((prev) => ({ ...prev, [id]: "Couldn't catch a time — try again or use a quick option above." }));
    }
  });

  const handleComplete = async (item, confirmed = false) => {
    setActionBusyId(item.id);
    const result = await transitionRecord(item.id, item.status, 'completed', { confirmed });
    setActionBusyId(null);
    if (result.requiresConfirmation) {
      setConfirmingId(item.id);
      setConfirmMessage(result.message);
      return;
    }
    if (result.success) {
      setExpandedId(null);
      setConfirmingId(null);
      await loadRecords();
    } else {
      setErrorById((prev) => ({ ...prev, [item.id]: result.message || result.error || 'Unknown error' }));
    }
  };

  const handleCancel = async (item) => {
    setActionBusyId(item.id);
    const result = await transitionRecord(item.id, item.status, 'cancelled', {});
    setActionBusyId(null);
    if (result.success) {
      setExpandedId(null);
      await loadRecords();
    } else {
      setErrorById((prev) => ({ ...prev, [item.id]: result.message || result.error || 'Unknown error' }));
    }
  };

  const renderItem = (item) => {
    const isExpanded = expandedId === item.id;
    const isReschedulingThis = reschedulingId === item.id;
    const isBusy = actionBusyId === item.id;

    return (
      <View key={item.id} style={styles.card}>
        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.due_date ? (
            <Text style={styles.cardSubtitle}>Due {new Date(item.due_date).toLocaleString()}</Text>
          ) : null}
          {item.closure_warning_started_at ? (
            <Text style={styles.cancelCountdown}>{getDaysLeftText(item.closure_warning_started_at)}</Text>
          ) : null}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              disabled={isBusy}
              onPress={() => setReschedulingId(isReschedulingThis ? null : item.id)}
            >
              <Text style={styles.actionBtnText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              disabled={isBusy}
              onPress={() => handleComplete(item)}
            >
              <Text style={[styles.actionBtnText, styles.completeBtnText]}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              disabled={isBusy}
              onPress={() => handleCancel(item)}
            >
              <Text style={[styles.actionBtnText, styles.cancelBtnText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {isReschedulingThis && (
          <View style={styles.reschedulePanel}>
            <View style={styles.quickPickRow}>
              <TouchableOpacity style={styles.quickPick} onPress={() => applyReschedule(item, getQuickPickDate('later_today'))}>
                <Text style={styles.quickPickText}>Later today</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickPick} onPress={() => applyReschedule(item, getQuickPickDate('tomorrow'))}>
                <Text style={styles.quickPickText}>Tomorrow</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickPick} onPress={() => applyReschedule(item, getQuickPickDate('next_week'))}>
                <Text style={styles.quickPickText}>Next week</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.micRow, isRecording && styles.micRowRecording]}
              onPress={handleMicPress}
              disabled={isTranscribing}
            >
              <Text style={styles.micIcon}>{isRecording ? '⏹️' : '🎙️'}</Text>
              <Text style={styles.micRowText}>
                {isTranscribing ? 'Listening for a date...' : isRecording ? 'Tap to stop' : 'Or say a date/time'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {confirmingId === item.id && (
          <View style={styles.confirmPanel}>
            <Text style={styles.confirmText}>{confirmMessage}</Text>
            <View style={styles.confirmButtonRow}>
              <TouchableOpacity style={styles.confirmNoBtn} onPress={() => setConfirmingId(null)}>
                <Text style={styles.confirmNoBtnText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmYesBtn} onPress={() => handleComplete(item, true)}>
                <Text style={styles.confirmYesBtnText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {warningById[item.id] && (
          <Text style={styles.inlineWarning}>{warningById[item.id]}</Text>
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
        <Text style={styles.headerTitle}>Queue</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'sorted' && styles.viewToggleActive]}
            onPress={() => setViewMode('sorted')}
          >
            <Text style={[styles.viewToggleText, viewMode === 'sorted' && styles.viewToggleTextActive]}>Sorted</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === 'stacked' && styles.viewToggleActive]}
            onPress={() => setViewMode('stacked')}
          >
            <Text style={[styles.viewToggleText, viewMode === 'stacked' && styles.viewToggleTextActive]}>Stacked</Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'sorted' ? (
        <>
          <View style={styles.pillRow}>
            <TouchableOpacity
              style={[styles.pill, activeFilter === 'all' && styles.pillActive]}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={[styles.pillText, activeFilter === 'all' && styles.pillTextActive]}>All</Text>
              <View style={[styles.countBadge, activeFilter === 'all' && styles.countBadgeActive]}>
                <Text style={[styles.countBadgeText, activeFilter === 'all' && styles.countBadgeTextActive]}>
                  {records.length}
                </Text>
              </View>
            </TouchableOpacity>
            {STATUS_ORDER.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.pill, activeFilter === status && styles.pillActive]}
                onPress={() => setActiveFilter(status)}
              >
                <Text style={[styles.pillText, activeFilter === status && styles.pillTextActive]}>
                  {STATUS_META[status].label}
                </Text>
                <View style={[styles.countBadge, activeFilter === status && styles.countBadgeActive]}>
                  <Text style={[styles.countBadgeText, activeFilter === status && styles.countBadgeTextActive]}>
                    {records.filter((r) => r.status === status).length}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={activeFilter === 'all' ? records : records.filter((r) => r.status === activeFilter)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => renderItem(item)}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListEmptyComponent={<Text style={styles.emptyText}>Nothing here.</Text>}
          />
        </>
      ) : (
        <FlatList
          data={STATUS_ORDER}
          keyExtractor={(status) => status}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderItem={({ item: status }) => {
            const group = records.filter((r) => r.status === status);
            if (group.length === 0) return null;
            return (
              <View style={styles.group}>
                <View style={[styles.groupLabel, { backgroundColor: STATUS_META[status].bg }]}>
                  <Text style={[styles.groupLabelText, { color: STATUS_META[status].color }]}>
                    {STATUS_META[status].label}
                  </Text>
                  <View style={[styles.countBadge, { backgroundColor: STATUS_META[status].color }]}>
                    <Text style={styles.countBadgeText}>{group.length}</Text>
                  </View>
                </View>
                {group.map((item) => renderItem(item))}
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Nothing here.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.md,
  },
  headerTitle: { fontSize: typography.size.xxl, fontWeight: typography.weight.bold, color: colors.textPrimary },
  viewToggle: { flexDirection: 'row', backgroundColor: colors.border, borderRadius: borderRadius.md, padding: 3 },
  viewToggleBtn: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: borderRadius.sm },
  viewToggleActive: { backgroundColor: colors.primary },
  viewToggleText: { fontSize: typography.size.sm, color: colors.textSecondary, fontWeight: typography.weight.medium },
  viewToggleTextActive: { color: colors.surface, fontWeight: typography.weight.bold },
  pillRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, paddingBottom: spacing.md, gap: spacing.sm },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: 999, backgroundColor: colors.border },
  pillActive: { backgroundColor: colors.textPrimary },
  pillText: { fontSize: typography.size.xs, color: colors.textSecondary },
  pillTextActive: { color: colors.surface, fontWeight: typography.weight.medium },
  countBadge: { backgroundColor: colors.textSecondary, borderRadius: 999, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  countBadgeActive: { backgroundColor: colors.surface },
  countBadgeText: { fontSize: 10, fontWeight: typography.weight.bold, color: colors.surface },
  countBadgeTextActive: { color: colors.textPrimary },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  group: { marginBottom: spacing.lg },
  groupLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: spacing.sm, borderRadius: borderRadius.sm, marginBottom: spacing.sm },
  groupLabelText: { fontSize: typography.size.xs, fontWeight: typography.weight.medium },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.surface },
  cardTitle: { fontSize: typography.size.md, fontWeight: typography.weight.medium, color: colors.textPrimary },
  cardSubtitle: { fontSize: typography.size.xs, color: colors.textSecondary, marginTop: 2 },
  cancelCountdown: { fontSize: typography.size.xs, color: colors.error, fontWeight: typography.weight.medium, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  actionBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, alignItems: 'center', backgroundColor: colors.border },
  actionBtnText: { fontSize: typography.size.xs, fontWeight: typography.weight.medium, color: colors.textPrimary },
  completeBtn: { backgroundColor: '#E6F4EA' },
  completeBtnText: { color: colors.success },
  cancelBtn: { backgroundColor: '#FCEAEA' },
  cancelBtnText: { color: colors.error },
  reschedulePanel: { marginTop: spacing.md, gap: spacing.sm },
  quickPickRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  quickPick: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: 999, backgroundColor: colors.border },
  quickPickText: { fontSize: typography.size.xs, color: colors.textPrimary },
  micRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border },
  micRowRecording: { backgroundColor: '#FFF0F0' },
  micIcon: { fontSize: 18 },
  micRowText: { fontSize: typography.size.xs, color: colors.textSecondary },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  confirmPanel: { marginTop: spacing.md, padding: spacing.sm, borderRadius: borderRadius.sm, backgroundColor: '#FFF8E8' },
  confirmText: { fontSize: typography.size.xs, color: colors.textPrimary, marginBottom: spacing.sm },
  confirmButtonRow: { flexDirection: 'row', gap: spacing.sm },
  confirmNoBtn: { flex: 1, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, alignItems: 'center', backgroundColor: colors.border },
  confirmNoBtnText: { fontSize: typography.size.xs, color: colors.textPrimary, fontWeight: typography.weight.medium },
  confirmYesBtn: { flex: 1, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, alignItems: 'center', backgroundColor: colors.primary },
  confirmYesBtnText: { fontSize: typography.size.xs, color: colors.surface, fontWeight: typography.weight.bold },
  inlineError: { fontSize: typography.size.xs, color: colors.error, marginTop: spacing.sm },
  inlineWarning: { fontSize: typography.size.xs, color: colors.error, fontWeight: typography.weight.medium, marginTop: spacing.sm },
});