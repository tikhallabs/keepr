import notifee, { AndroidImportance } from '@notifee/react-native';
import { supabase } from './supabase';

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const CHANNEL_ID = 'keepr-default';

// Prevents re-firing the same notification within one app session.
// Cleared on app restart — acceptable for MVP, avoids a DB column migration.
const firedThisSession = new Set();

async function fireNotification(id, title, body) {
  if (firedThisSession.has(id)) return;
  await notifee.displayNotification({
    id,
    title,
    body,
    android: { channelId: CHANNEL_ID },
  });
  firedThisSession.add(id);
}

async function runChecks() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  if (!userId) return;

  const now = new Date();
  const in60min = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  const ago30min = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  const [dueRes, overdueRes, rescheduleRes, incompleteRes] = await Promise.all([
    // Query 1 — Due within 60 minutes
    supabase
      .from('records')
      .select('id, title, due_date')
      .eq('user_id', userId)
      .eq('object_type', 'commitment')
      .eq('status', 'scheduled')
      .gt('due_date', nowIso)
      .lte('due_date', in60min),

    // Query 2 — Overdue
    supabase
      .from('records')
      .select('id, title')
      .eq('user_id', userId)
      .eq('object_type', 'commitment')
      .eq('status', 'overdue'),

    // Query 3 — Reschedule warnings (D016: 3+ reschedules, not terminal)
    supabase
      .from('records')
      .select('id, title, reschedule_count')
      .eq('user_id', userId)
      .eq('object_type', 'commitment')
      .gte('reschedule_count', 3)
      .not('status', 'in', '(completed,cancelled,closed,converted)'),

    // Query 4 — Incomplete for more than 30 minutes (D013)
    supabase
      .from('records')
      .select('id, title')
      .eq('user_id', userId)
      .eq('object_type', 'commitment')
      .eq('status', 'incomplete')
      .lt('created_at', ago30min),
  ]);

  for (const record of dueRes.data ?? []) {
    const mins = Math.round((new Date(record.due_date) - now) / 60000);
    await fireNotification(
      `due-${record.id}`,
      'Due Soon',
      `"${record.title}" is due in ${mins} minute${mins !== 1 ? 's' : ''}.`
    );
  }

  for (const record of overdueRes.data ?? []) {
    await fireNotification(
      `overdue-${record.id}`,
      'Commitment Overdue',
      `"${record.title}" is overdue. Reschedule, complete, or cancel.`
    );
  }

  for (const record of rescheduleRes.data ?? []) {
    await fireNotification(
      `reschedule-${record.id}`,
      'Last Reschedule Warning',
      `"${record.title}" has been rescheduled ${record.reschedule_count} times. This is the last attempt.`
    );
  }

  for (const record of incompleteRes.data ?? []) {
    await fireNotification(
      `incomplete-${record.id}`,
      'Incomplete Commitment',
      `"${record.title}" is still incomplete. Add a due date or cancel it.`
    );
  }
}

// Call once at app startup before startNotificationScheduler().
// Android requires a channel to exist before any notification can display.
export async function initNotifee() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Keepr Notifications',
    importance: AndroidImportance.HIGH,
  });
}

// Call after sign-in. Runs an immediate check, then polls every 5 minutes.
// Returns a cleanup function — call it in a useEffect cleanup.
export function startNotificationScheduler() {
  runChecks();
  const intervalId = setInterval(runChecks, POLL_INTERVAL_MS);
  return () => clearInterval(intervalId);
}
