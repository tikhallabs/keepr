// briefingService.js — U13: Morning Briefing data fetch + GPT headline
import { supabase } from './supabase';
import Constants from 'expo-constants';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

export async function fetchBriefingData(userId) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const [{ data: userData }, { data: records, error }] = await Promise.all([
    supabase.from('users').select('full_name').eq('id', userId).single(),
    supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .eq('object_type', 'commitment')
      .in('status', ['overdue', 'scheduled', 'incomplete', 'unscheduled'])
      .order('due_date', { ascending: true, nullsFirst: false }),
  ]);

  if (error) throw error;

  const overdue = records.filter((r) => r.status === 'overdue');

  const dueToday = records.filter((r) => {
    if (r.status !== 'scheduled' || !r.due_date) return false;
    const d = new Date(r.due_date);
    return d >= todayStart && d < todayEnd;
  });

  const needsAttention = records.filter(
    (r) => r.status === 'incomplete' || r.status === 'unscheduled'
  );

  const firstName = userData?.full_name?.trim().split(' ')[0] || 'there';

  return { firstName, overdue, dueToday, needsAttention };
}

export async function generateHeadline({ overdue, dueToday, needsAttention }) {
  if (overdue.length === 0 && dueToday.length === 0) return null;

  const apiKey = Constants.expoConfig?.extra?.openaiApiKey;
  if (!apiKey) throw new Error('OpenAI API key not found.');

  const mostUrgent = [...overdue].sort(
    (a, b) => new Date(a.due_date) - new Date(b.due_date)
  )[0];

  const lines = [
    'You are Keepr, an AI commitment operating system.',
    `The user has: ${overdue.length} overdue commitment(s), ${dueToday.length} due today, ${needsAttention.length} incomplete or unscheduled.`,
  ];
  if (mostUrgent) {
    lines.push(
      `Most urgent overdue item: "${mostUrgent.title}" (due ${new Date(mostUrgent.due_date).toLocaleDateString()}).`
    );
  }
  lines.push(
    'Write ONE sentence (max 20 words) telling the user what most deserves their attention today. Be direct. No filler words.'
  );

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 60,
      messages: [{ role: 'user', content: lines.join('\n') }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Briefing headline call failed.');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}
