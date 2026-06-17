import { supabase } from './supabase'; // ASSUMPTION — adjust to match your actual import path

const TERMINAL_STATUSES = ['closed', 'cancelled', 'converted'];

// Defines every legal move. Anything not listed here is blocked.
const TRANSITION_MATRIX = {
  incomplete: {
    unscheduled: { requiresConfirmation: false },
    scheduled: { requiresConfirmation: false },
    completed: { requiresConfirmation: true },
    cancelled: { requiresConfirmation: false },
  },
  unscheduled: {
    scheduled: { requiresConfirmation: false },
    completed: { requiresConfirmation: true },
    cancelled: { requiresConfirmation: false },
  },
  scheduled: {
    completed: { requiresConfirmation: false },
    cancelled: { requiresConfirmation: false },
    overdue: { requiresConfirmation: false, systemOnly: true }, // set by cron, not via this function in practice
  },
  overdue: {
    scheduled: { requiresConfirmation: false }, // this is a reschedule
    completed: { requiresConfirmation: false },
    cancelled: { requiresConfirmation: false },
    closed: { requiresConfirmation: false, systemOnly: true }, // U12 will trigger this later, not U09
  },
};

export async function transitionRecord(recordId, fromStatus, toStatus, options = {}) {
  const { confirmed = false, changeReason = null } = options;

  // Rule 1: terminal states can never move anywhere
  if (TERMINAL_STATUSES.includes(fromStatus)) {
    return { success: false, blocked: true, message: 'Create a new commitment' };
  }

  // Rule 2: the move has to exist in the matrix at all
  const rule = TRANSITION_MATRIX[fromStatus]?.[toStatus];
  if (!rule) {
    return { success: false, blocked: true, message: `Cannot move from "${fromStatus}" to "${toStatus}".` };
  }

  // Rule 3: some moves need explicit confirmation before they happen
  if (rule.requiresConfirmation && !confirmed) {
    return {
      success: false,
      requiresConfirmation: true,
      message: `Are you sure you want to mark this as "${toStatus}"? It hasn't gone through the normal flow.`,
    };
  }

  const nowIso = new Date().toISOString();
  const updates = { status: toStatus, updated_at: nowIso };
  if (toStatus === 'completed') updates.completed_at = nowIso;

  // Reschedule: overdue -> scheduled bumps the counter
  let newRescheduleCount = null;
  if (fromStatus === 'overdue' && toStatus === 'scheduled') {
    const { data: current, error: fetchErr } = await supabase
      .from('records')
      .select('reschedule_count')
      .eq('id', recordId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };

    newRescheduleCount = (current?.reschedule_count || 0) + 1;
    updates.reschedule_count = newRescheduleCount;
  }

  const { error: updateErr } = await supabase.from('records').update(updates).eq('id', recordId);
  if (updateErr) return { success: false, error: updateErr.message };

  const { data: userData } = await supabase.auth.getUser();

  const { error: auditErr } = await supabase.from('record_audit').insert({
    record_id: recordId,
    user_id: userData?.user?.id,
    from_status: fromStatus,
    to_status: toStatus,
    change_reason: changeReason,
    changed_at: nowIso,
  });

  if (auditErr) {
    return { success: true, auditWarning: 'Status updated, but audit log failed: ' + auditErr.message };
  }

  return { success: true, newStatus: toStatus, rescheduleCount: newRescheduleCount };
}

// D020 — reopen a completed commitment, only within 7 days
export async function reopenRecord(recordId, newStatus, options = {}) {
  const { confirmed = false, changeReason = null } = options;

  if (!['scheduled', 'overdue'].includes(newStatus)) {
    return { success: false, error: 'reopenRecord can only set status to "scheduled" or "overdue".' };
  }

  const { data: record, error: fetchErr } = await supabase
    .from('records')
    .select('status, completed_at')
    .eq('id', recordId)
    .single();

  if (fetchErr) return { success: false, error: fetchErr.message };

  if (record.status !== 'completed') {
    return { success: false, blocked: true, message: 'Only completed commitments can be reopened.' };
  }

  const daysSinceCompletion = (new Date() - new Date(record.completed_at)) / (1000 * 60 * 60 * 24);
  if (daysSinceCompletion > 7) {
    return {
      success: false,
      blocked: true,
      message: 'This was completed more than 7 days ago and can no longer be reopened. Create a new commitment.',
    };
  }

  if (!confirmed) {
    return { success: false, requiresConfirmation: true, message: 'Are you sure you want to reopen this completed commitment?' };
  }

  const nowIso = new Date().toISOString();
  const { error: updateErr } = await supabase.from('records').update({ status: newStatus, updated_at: nowIso }).eq('id', recordId);
  if (updateErr) return { success: false, error: updateErr.message };

  const { data: userData } = await supabase.auth.getUser();

   const { error: auditErr } = await supabase.from('record_audit').insert({
    record_id: recordId,
    user_id: userData?.user?.id,
    from_status: 'completed',
    to_status: newStatus,
    change_reason: changeReason || 'user_action',
    notes: 'Reopened within 7-day window',
    changed_at: nowIso,
  });

  if (auditErr) {
    return { success: true, auditWarning: 'Reopened, but audit log failed: ' + auditErr.message };
  }

  return { success: true, newStatus };
}