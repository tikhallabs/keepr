import { supabase } from './supabase';
import Constants from 'expo-constants';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const EXTRACTION_PROMPT = `You are a name extraction assistant. Extract only the names of individual people (not companies, places, job titles, or generic terms) from the commitment text.

Return a JSON object in this exact format: { "people": ["name1", "name2"] }
If no people are mentioned, return: { "people": [] }

Rules:
- Include first names only if that's all that's given ("Call John" → "John")
- Include full names when both are present ("Meet Sarah Chen" → "Sarah Chen")
- Ignore company names, even if they sound like names ("Amazon", "Accenture")
- Ignore role/title references without a name ("talk to HR", "email the team")
- Ignore the user themselves — only extract OTHER people

Examples:
"Call John about the proposal" → { "people": ["John"] }
"Meeting with Sarah Chen and Mike tomorrow" → { "people": ["Sarah Chen", "Mike"] }
"Submit report to HR by Friday" → { "people": [] }
"Follow up with Amazon order" → { "people": [] }
"Lunch with David from Accenture" → { "people": ["David"] }`;

async function extractPeopleFromText(text) {
  const apiKey = Constants.expoConfig?.extra?.openaiApiKey;
  if (!apiKey || !text?.trim()) return [];

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.1,
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!response.ok) return [];

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return [];

  const parsed = JSON.parse(content);
  return Array.isArray(parsed.people)
    ? parsed.people.filter(n => typeof n === 'string' && n.trim())
    : [];
}

async function findOrCreatePerson(userId, fullName) {
  const normalised = fullName.trim();

  const { data: existing } = await supabase
    .from('people')
    .select('id')
    .eq('user_id', userId)
    .ilike('full_name', normalised)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('people')
    .insert({
      user_id: userId,
      full_name: normalised,
      ai_extracted: true,
      confirmed_by_user: false,
    })
    .select('id')
    .single();

  if (error) throw error;
  return created.id;
}

async function linkPersonToRecord(recordId, personId) {
  const { error } = await supabase
    .from('record_people')
    .insert({ record_id: recordId, person_id: personId, role: 'mentioned' });

  if (error) throw error;
}

export async function processPeopleForRecord(userId, recordId, text) {
  const names = await extractPeopleFromText(text);
  if (names.length === 0) return [];

  const results = [];
  for (const name of names) {
    const personId = await findOrCreatePerson(userId, name);
    await linkPersonToRecord(recordId, personId);
    results.push({ personId, fullName: name });
  }
  return results;
}

export async function confirmAllPeople(personIds) {
  const { error } = await supabase
    .from('people')
    .update({ confirmed_by_user: true })
    .in('id', personIds);

  if (error) throw error;
}
