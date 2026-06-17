import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { supabase } from '../services/supabase';
import { transitionRecord, reopenRecord } from '../services/lifecycleService';

const TEST_USER_ID = 'cddeed4f-f3b2-404e-b49a-34dc28c17595';

async function runLifecycleTest() {
  console.log('--- LIFECYCLE TEST START ---');

  // 1. Create a throwaway test record
  const { data: created, error: createErr } = await supabase
    .from('records')
    .insert({
      user_id: TEST_USER_ID,
      object_type: 'commitment',
      title: 'LIFECYCLE TEST RECORD - safe to delete',
      capture_method: 'text',
      status: 'incomplete',
    })
    .select()
    .single();

  if (createErr) {
    console.log('FAILED to create test record:', createErr.message);
    return;
  }

  const recordId = created.id;
  console.log('Created test record:', recordId);

  // 2. Normal allowed move: incomplete -> scheduled
  const r1 = await transitionRecord(recordId, 'incomplete', 'scheduled');
  console.log('TEST 1 (incomplete -> scheduled, should succeed):', r1);

  // 3. Blocked move: try moving out of a terminal state
  await supabase.from('records').update({ status: 'closed' }).eq('id', recordId);
  const r2 = await transitionRecord(recordId, 'closed', 'scheduled');
  console.log('TEST 2 (closed -> scheduled, should be BLOCKED):', r2);

  await supabase.from('records').update({ status: 'scheduled' }).eq('id', recordId);

  // 4. Normal completion flow
  const r3 = await transitionRecord(recordId, 'scheduled', 'completed');
  console.log('TEST 3 (scheduled -> completed, should succeed):', r3);

  await supabase.from('records').update({ status: 'overdue', reschedule_count: 0 }).eq('id', recordId);

  // 5. Reschedule: overdue -> scheduled, check reschedule_count increments
  const r4 = await transitionRecord(recordId, 'overdue', 'scheduled');
  console.log('TEST 4 (overdue -> scheduled, reschedule, count should be 1):', r4);

  // 6. Skip-step move requiring confirmation
  await supabase.from('records').update({ status: 'unscheduled' }).eq('id', recordId);
  const r5a = await transitionRecord(recordId, 'unscheduled', 'completed');
  console.log('TEST 5a (unscheduled -> completed, NO confirm, should ask for confirmation):', r5a);

  const r5b = await transitionRecord(recordId, 'unscheduled', 'completed', { confirmed: true });
  console.log('TEST 5b (unscheduled -> completed, WITH confirm, should succeed):', r5b);

  // 7. Reopen test
  const r6a = await reopenRecord(recordId, 'scheduled');
  console.log('TEST 6a (reopen, NO confirm, should ask for confirmation):', r6a);

  const r6b = await reopenRecord(recordId, 'scheduled', { confirmed: true });
  console.log('TEST 6b (reopen, WITH confirm, should succeed):', r6b);

  console.log('--- LIFECYCLE TEST END --- (test record id: ' + recordId + ', delete manually from Supabase when done)');
}

export default function LifecycleTestScreen() {
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <ScrollView>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>Lifecycle Service Test</Text>
        <Pressable
          onPress={runLifecycleTest}
          style={{ backgroundColor: '#222', padding: 16, borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>Run Lifecycle Test</Text>
        </Pressable>
        <Text style={{ marginTop: 20, color: '#666' }}>
          Tap the button, then check your terminal/browser console for TEST 1–6 results.
        </Text>
      </ScrollView>
    </View>
  );
}