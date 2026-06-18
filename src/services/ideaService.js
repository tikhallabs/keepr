import { supabase } from './supabase';
import { createRecord } from './recordsService';

export async function promoteIdeaToCommitment(ideaId, userId) {
  const { data: idea, error: fetchErr } = await supabase
    .from('records')
    .select('object_type, status, converted_to_id, title, body')
    .eq('id', ideaId)
    .single();

  if (fetchErr) return { success: false, error: fetchErr.message };

  if (idea.object_type !== 'idea') {
    return { success: false, blocked: true, message: 'Only Ideas can be promoted to Commitments.' };
  }

  if (idea.status === 'converted' || idea.converted_to_id) {
    return { success: false, blocked: true, message: 'This idea has already been promoted to a commitment.' };
  }

const newCommitment = await createRecord({
  userId,
  title: idea.title,
  body: idea.body,
  objectType: 'commitment',
  captureMethod: 'system',
  status: 'unscheduled',
});

  const nowIso = new Date().toISOString();

  const { error: updateErr } = await supabase
    .from('records')
    .update({ status: 'converted', converted_to_id: newCommitment.id, updated_at: nowIso })
    .eq('id', ideaId);

  if (updateErr) return { success: false, error: updateErr.message };

  const { data: userData } = await supabase.auth.getUser();

  const { error: auditErr } = await supabase.from('record_audit').insert({
    record_id: ideaId,
    user_id: userData?.user?.id,
    from_status: idea.status,
    to_status: 'converted',
    change_reason: 'user_action',
    notes: `Promoted to new commitment ${newCommitment.id}`,
    changed_at: nowIso,
  });

  if (auditErr) {
    return { success: true, newCommitmentId: newCommitment.id, auditWarning: 'Promoted, but audit log failed: ' + auditErr.message };
  }

  return { success: true, newCommitmentId: newCommitment.id };
}