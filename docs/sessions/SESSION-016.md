# SESSION-016 — U13 Morning Briefing
**Date:** 2026-06-25
**Utility:** U13 — Morning Briefing
**Status:** Complete (pending device test)

---

## What was built

Replaced the HomeScreen placeholder with a real Morning Briefing screen.

### New files
- `src/services/briefingService.js` — two exported functions:
  - `fetchBriefingData(userId)` — queries `users` table for first name, then `records` table for all open commitments, returns `{ firstName, overdue, dueToday, needsAttention }`
  - `generateHeadline({ overdue, dueToday, needsAttention })` — calls GPT-4o-mini, returns a single sentence (max 20 words). Skips the API call entirely if overdue + dueToday count is zero.
- `src/components/BriefingHeader.js` — greeting (Good morning/afternoon/evening) + today's date, driven by local device time
- `src/components/AIHeadline.js` — card that shows loading skeleton, "You're clear" state, or the GPT headline
- `src/components/BriefingList.js` — SectionList with three groups: Overdue (red), Due Today (gold), Needs Attention (grey). Empty groups are hidden. Tapping any item navigates to the Queue tab.

### Modified files
- `src/screens/HomeScreen.js` — full replacement. Uses `useFocusEffect` for auto-refresh on tab focus + `RefreshControl` for pull-to-refresh. Headline loads after data; errors in the GPT call are caught silently (fallback to null = "clear" state shown).

---

## Decisions applied
- D009 — Morning Briefing is the primary home screen
- D024 — AI Executive Summary at the top
- D025 — Single headline insight, most important overdue commitment
- D013 — Incomplete records surfaced in briefing
- D014 — Unresolved commitments appear in briefing
- D003 — GPT call skipped entirely when nothing is overdue or due today

---

## Data shape
User name: `users.full_name` (first word used for greeting)
Records filtered: `object_type = 'commitment'` + status in `['overdue','scheduled','incomplete','unscheduled']`
Due Today logic: `status = 'scheduled'` AND `due_date` falls within today's local date boundaries (midnight → midnight)

---

## Open items / known gaps
- Requires device test via `npx expo run:android` (Expo Go no longer works)
- If `users.full_name` is null for any reason, greeting falls back to "Good morning, there."
- GPT headline failure is silent — user sees "You're clear" card rather than an error message. This is intentional for MVP.
