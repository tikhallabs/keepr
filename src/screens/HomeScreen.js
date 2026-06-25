// HomeScreen.js — U13: Morning Briefing (D009, D024, D025)
import { useState, useCallback } from 'react';
import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { fetchBriefingData, generateHeadline } from '../services/briefingService';
import { colors, spacing } from '../constants/theme';
import BriefingHeader from '../components/BriefingHeader';
import AIHeadline from '../components/AIHeadline';
import BriefingList from '../components/BriefingList';

export default function HomeScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [overdue, setOverdue] = useState([]);
  const [dueToday, setDueToday] = useState([]);
  const [needsAttention, setNeedsAttention] = useState([]);
  const [headline, setHeadline] = useState(null);
  const [headlineLoading, setHeadlineLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const briefing = await fetchBriefingData(user.id);
    setFirstName(briefing.firstName);
    setOverdue(briefing.overdue);
    setDueToday(briefing.dueToday);
    setNeedsAttention(briefing.needsAttention);

    setHeadlineLoading(true);
    try {
      const hl = await generateHeadline({
        overdue: briefing.overdue,
        dueToday: briefing.dueToday,
        needsAttention: briefing.needsAttention,
      });
      setHeadline(hl);
    } catch (_) {
      setHeadline(null);
    } finally {
      setHeadlineLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleItemPress = useCallback(() => {
    navigation.navigate('Queue');
  }, [navigation]);

  const hasItems = overdue.length > 0 || dueToday.length > 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
    >
      <BriefingHeader firstName={firstName} />

      <AIHeadline
        headline={headline}
        loading={headlineLoading}
        hasItems={hasItems}
      />

      <BriefingList
        overdue={overdue}
        dueToday={dueToday}
        needsAttention={needsAttention}
        onItemPress={handleItemPress}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
