# KEEPR — Session 008 — 16 June 2026

## Utility Worked On
U08 — AI Understanding Engine (GPT-4o: Commitment vs Idea routing + extraction)

## Status at Session End
Complete ✅

## What Was Built
AI classification layer wired into the existing capture flow:
- Idea toggle selected → saves directly, no AI call (cost control per D003)
- Commitment toggle selected (default) → sends body text to GPT-4o-mini for classification
- AI can reclassify a "Commitment" input as an Idea if content warrants it — user sees a brief "Saved as Idea" on-screen indication before the modal closes
- AI extracts title, due_date, and a numeric ai_confidence score (0–1)
- Relative date/time resolution rules implemented: today (no time) = 4 hrs from now, tomorrow (no time) = 11:00 AM local, day after tomorrow = 11:00 AM local, morning = 10:00 AM local, afternoon = 2:00 PM local
- Explicit times stated by user are respected as-is, not overridden by defaults
- Current date/time dynamically injected into the AI prompt on every call (fixes AI defaulting to training-data dates)

## Files Created
- `src/services/aiService.js` — GPT-4o-mini call, system prompt with date rules, response parsing

## Files Modified
- `src/screens/CaptureScreen.js` — `handleSave` branches on objectType; added `savedAsIdea` state + on-screen reclassification message
- `src/services/recordsService.js` — `createRecord` now accepts optional `title`, `dueDate`, `aiProcessed`, `aiConfidence` params instead of hardcoding them

## Bug Fixed This Session
`ai_confidence` column in Supabase is `double precision` (numeric), but code initially returned string values ("high"/"low") — caused Postgres error 22P02 on insert. Fixed by having AI return a 0–1 confidence score instead of a string label.

## Decisions Referenced
- D003 — AI used only where necessary (Idea path skips AI entirely)
- D023 — Universal Record Model (Commitment vs Idea object_type routing)
- P001 — Capture First: AI never blocks save, only classifies after

## Decision Changed This Session
Notification/display time conversion will use the **device's current timezone at the moment of display/notification**, not the timezone captured once during First Time Setup (U02). Relevant for future travel scenarios. To be implemented in U11 (Queue System) and U12 (Notification Engine) — not built yet.

## Parking Item Noted (Not Built)
Future "My Settings" screen to let user customize relative time-mapping defaults (today/tomorrow/morning/afternoon definitions) instead of hardcoded values in the AI prompt. Revisit after MVP output is reviewed end-to-end.

## Known Limitations
- No clarification questions yet (D013 — max 2 questions budget not yet implemented)
- due_date stored in UTC; local-time conversion for display/notifications not yet built (comes in U11/U12)

## Next Session Starts With
U09 — Commitment Lifecycle Engine (states + transitions)
First step: review current `status` field values and confirm full list of lifecycle states needed