// aiService.js — AI Understanding Engine (U08)
// Sends captured text to GPT-4o-mini and returns structured extraction:
// object_type, title, due_date, status, ai_confidence
import Constants from 'expo-constants';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are the AI Understanding Engine for Keepr, a Commitment Operating System.

Given raw captured text, extract structured fields. Respond with ONLY a JSON object, no other text.

Fields to return:
- object_type: "commitment" or "idea"
  - Commitment: a promise, request, obligation, follow-up, or personal intention (has an action and/or deadline)
  - Idea: a thought, observation, or creative input with no required action
- title: a short, clean version of the input (max ~80 characters)
- due_date: an ISO 8601 date/time string if a date or time is mentioned, otherwise null.
  - If an exact clock time is stated anywhere in the input (e.g. "7am", "3:30pm", "19:00"), ALWAYS use that exact time, combined with whatever date is implied (today, tomorrow, a specific date, etc). The exact stated time always overrides the default times below — never substitute a default when an exact time is present.
  - Only when NO exact time is stated anywhere in the input, use these defaults:
    - "today" (no time) → 4 hours from the current time given below
    - "tomorrow" (no time) → tomorrow at 11:00 AM local time
    - "day after tomorrow" (no time) → that day at 11:00 AM local time
    - "morning" (no exact time) → 10:00 AM local time on the date implied
    - "afternoon" (no exact time) → 2:00 PM local time on the date implied
  - Examples:
    - "call John at 7am tomorrow" → tomorrow's date at 07:00 local time
    - "submit the report by 3pm today" → today's date at 15:00 local time
    - "follow up tomorrow morning" → tomorrow's date at 10:00 AM local time (no exact time stated, default applies)

- status: always "incomplete"
- ai_confidence: a number between 0 and 1 representing how confident you are in object_type and title — use 0.9+ if clear and unambiguous, 0.4-0.6 if you had to guess

Respond with valid JSON only, in this exact shape:
{
  "object_type": "commitment" or "idea",
  "title": "string",
  "due_date": "ISO 8601 string or null",
  "status": "incomplete",
  "ai_confidence": 0.0 to 1.0
}`;

export async function understandCapture(rawText) {
  const now = new Date();
  const currentDateTime = now.toString(); // includes local date, time, and timezone
  const apiKey = Constants.expoConfig?.extra?.openaiApiKey;

  if (!apiKey) {
    throw new Error('OpenAI API key not found. Check your .env file.');
  }

  if (!rawText || !rawText.trim()) {
    throw new Error('understandCapture: rawText is empty');
  }

  const response = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: `${SYSTEM_PROMPT}\n\nToday's date and time is: ${currentDateTime}` },
        { role: 'user', content: rawText },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'AI understanding call failed.');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('understandCapture: no content returned from OpenAI');
  }

  const parsed = JSON.parse(content);

  return {
    object_type: parsed.object_type === 'idea' ? 'idea' : 'commitment',
    title: parsed.title || rawText.slice(0, 80),
    due_date: parsed.due_date || null,
    status: 'incomplete',
    ai_confidence: typeof parsed.ai_confidence === 'number' ? parsed.ai_confidence : 0.5,
    ai_processed: true,
  };
}