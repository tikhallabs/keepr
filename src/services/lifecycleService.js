import { supabase } from './supabase';

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
    overdue: { requiresConfirmation: false, systemOnly: true },
  },
  overdue: {
    scheduled: { requiresConfirmation: false },
    completed: { requiresConfirmation: false },
    cancelled: { requiresConfirmation: false },
    closed: { requiresConfirmation: false, systemOnly: true },
  },
};

export async function transitionRecord(recordId, fromStatus, toStatus, options = {}) {
  const { confirmed = false, changeReason = null, newDueDate = null } = options;

  if (TERMINAL_STATUSES.includes(fromStatus)) {
    return { success: false, blocked: true, message: 'Create a new commitment' };
  }

  const rule = TRANSITION_MATRIX[fromStatus]?.[toStatus];
  if (!rule) {
    return { success: false, blocked: true, message: `Cannot move from "${fromStatus}" to "${toStatus}".` };
  }

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
  if (newDueDate) updates.due_date = newDueDate;

  // Reschedule counting now happens in rescheduleRecord() below, not here.
  // transitionRecord() no longer touches reschedule_count.


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

  return { success: true, newStatus: toStatus };
}

// D020 — reopen a completed commitment, only within 7 days
export async function reopenRecord(recordId, newStatus, options = {}) {
  const { confirmed = false, changeReason = null } = options;

  if (!['scheduled', 'overdue', 'unscheduled'].includes(newStatus)) {
    return { success: false, error: 'reopenRecord can only set status to "scheduled", "overdue", or "unscheduled".' };
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

// Reschedule on an already-scheduled record — same status, new due_date, still logged
export async function updateDueDate(recordId, currentStatus, newDueDate, options = {}) {
  const { changeReason = 'user_action' } = options;
  const nowIso = new Date().toISOString();

  const { error: updateErr } = await supabase
    .from('records')
    .update({ due_date: newDueDate, updated_at: nowIso })
    .eq('id', recordId);
  if (updateErr) return { success: false, error: updateErr.message };

  const { data: userData } = await supabase.auth.getUser();

  const { error: auditErr } = await supabase.from('record_audit').insert({
    record_id: recordId,
    user_id: userData?.user?.id,
    from_status: currentStatus,
    to_status: currentStatus,
    change_reason: changeReason,
    notes: 'Due date changed via reschedule',
    changed_at: nowIso,
  });

  if (auditErr) {
    return { success: true, auditWarning: 'Due date updated, but audit log failed: ' + auditErr.message };
  }

  return { success: true };
}
// D016 — Repeated Reschedule Policy. Single entry point for ALL reschedules,
// whether the record is currently scheduled or overdue. Replaces calling
// updateDueDate() or transitionRecord() directly for reschedule actions.
export async function rescheduleRecord(recordId, fromStatus, newDueDate) {
  const { data: current, error: fetchErr } = await supabase
    .from('records')
    .select('reschedule_count')
    .eq('id', recordId)
    .single();

  if (fetchErr) return { success: false, error: fetchErr.message };

  const newCount = (current?.reschedule_count || 0) + 1;

  // 4th attempt: block the reschedule, start the 7-day cancel countdown instead
  if (newCount >= 4) {
    const nowIso = new Date().toISOString();
    const { error: blockErr } = await supabase
      .from('records')
      .update({ closure_warning_started_at: nowIso, updated_at: nowIso })
      .eq('id', recordId);

    if (blockErr) return { success: false, error: blockErr.message };

    return {
      success: false,
      blocked: true,
      finalWarning: true,
      message: 'You have not kept this task after 3 reminders. Complete or Cancel now and create a new commitment. (I will cancel it automatically in 7 days.)',
    };
  }

  const nowIso = new Date().toISOString();
  const { error: updateErr } = await supabase
    .from('records')
    .update({ due_date: newDueDate, status: 'scheduled', reschedule_count: newCount, updated_at: nowIso })
    .eq('id', recordId);

  if (updateErr) return { success: false, error: updateErr.message };

  const { data: userData } = await supabase.auth.getUser();
  const { error: auditErr } = await supabase.from('record_audit').insert({
    record_id: recordId,
    user_id: userData?.user?.id,
    from_status: fromStatus,
    to_status: 'scheduled',
    change_reason: 'user_action',
    notes: 'Rescheduled via rescheduleRecord()',
    changed_at: nowIso,
  });

  let warning = null;
  if (newCount === 2) warning = '1 attempt left.';
  if (newCount === 3) warning = 'This is the last attempt.';

  if (auditErr) {
    return { success: true, newCount, warning, auditWarning: 'Rescheduled, but audit log failed: ' + auditErr.message };
  }

  return { success: true, newCount, warning };
}