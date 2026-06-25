import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { usePeople } from '../context/PeopleContext';
import { confirmAllPeople } from '../services/peopleService';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

const BANNER_HEIGHT = 80;
const AUTO_DISMISS_MS = 8000;

export default function PeopleConfirmBanner() {
  const { pendingPeople, clearPeopleBanner } = usePeople();
  const slideAnim = useRef(new Animated.Value(-BANNER_HEIGHT)).current;
  const dismissTimer = useRef(null);

  useEffect(() => {
    if (pendingPeople.length === 0) return;

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    dismissTimer.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(dismissTimer.current);
  }, [pendingPeople]);

  if (pendingPeople.length === 0) return null;

  const names = pendingPeople.map(p => p.fullName).join(', ');

  async function handleConfirm() {
    clearTimeout(dismissTimer.current);
    try {
      await confirmAllPeople(pendingPeople.map(p => p.personId));
    } catch (_) {
      // silent — person stays unconfirmed, can be confirmed later
    }
    dismiss();
  }

  function dismiss() {
    clearTimeout(dismissTimer.current);
    Animated.timing(slideAnim, {
      toValue: -BANNER_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => clearPeopleBanner());
  }

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.message} numberOfLines={1}>
        People found: <Text style={styles.names}>{names}</Text>
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={dismiss} style={styles.dismissBtn}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: colors.primary,
    paddingTop: 48,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  message: {
    flex: 1,
    fontSize: typography.size.sm,
    color: '#FFFFFF',
    marginRight: spacing.sm,
  },
  names: {
    fontWeight: typography.weight.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  confirmBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  confirmText: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  dismissBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  dismissText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.size.sm,
  },
});
