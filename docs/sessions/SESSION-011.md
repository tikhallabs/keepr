# KEEPR — Session 011 — 2026-06-17

## Utility Worked On
U10 — Idea Engine (continued) and U11 — Queue System

## Status at Session End
In Progress

## What Was Built

U10 continued:
- Confirmed promotion design: one Idea row promotes exactly once (terminal), `converted_to_id` points to a single new Commitment; user records a fresh capture for the new Commitment's actual content rather than auto-copying the Idea's text or re-running AI extraction on it
- Confirmed Projects/buckets (D007/D008 hierarchy) stay parked for a future utility, not absorbed into U10
- `capture_method` check constraint only allowed voice/text/ocr — none accurately describe a system-created placeholder row. Migration added `system` as a fourth allowed value
- `recordsService.js`: `createRecord()` extended with an optional `captureMethod` parameter (defaults to `text`, backward-compatible)
- Created `src/services/ideaService.js` — `promoteIdeaToCommitment()`: validates the record is an Idea and not already converted, creates a blank placeholder Commitment, updates the Idea to `converted` with `converted_to_id` set, logs to `record_audit`
- Not yet tested — still deferred, since the real Ideas screen was not built this session either

U11 — Queue System:
- Design decided: one Queue screen with two switchable views — Sorted (status pills, one filter at a time) and Stacked (all open statuses grouped at once, Overdue first per D015) — plus a separate standalone Ideas screen
- Navigation rebuilt: installed `@react-navigation/bottom-tabs` and `@expo/vector-icons`; added a persistent bottom tab bar (Home / Queue / Ideas) via new `src/navigation/MainTabs.js`; extracted the floating mic button into shared `src/components/FloatingMicButton.js`, rendered at the tab-navigator level so it persists across all tabs without duplication
- Created placeholder `QueueScreen.js` and `IdeasScreen.js`, then fully rewrote `QueueScreen.js`: live record fetching, Sorted/Stacked toggle, per-status count badges on pills and group labels, tap-to-expand cards
- Built the action layer per D015: expanding a card reveals Reschedule / Complete / Cancel. Reschedule expands into three quick-pick chips (Later today = +4 hours, Tomorrow, Next week) plus a mic button reusing U06's voice recorder and U08's `understandCapture()` purely to extract a due date from speech
- `lifecycleService.js` extended: `transitionRecord()` accepts an optional `newDueDate`; new `updateDueDate()` added for changing the due date on an already-scheduled record without a status transition, still logged to `record_audit`
- New shared `src/constants/statusMeta.js` — status labels, colors, display order (Overdue first)

## Bugs Found and Fixed This Session
1. Status-default bug (pre-existing since U05): `createRecord()` hardcoded `status: 'incomplete'` regardless of whether a due_date was extracted. Fixed — commitment with a due_date now defaults to `scheduled`, without one to `unscheduled`; Ideas still default to `incomplete`. `ideaService.js`'s placeholder explicitly overrides back to `incomplete`.
2. Stale data on tab switch: Queue only fetched once on mount; tab screens stay alive in the background. Fixed with `useFocusEffect`, refetching quietly on every focus.
3. `Alert.alert()` does not work on web (confirmed via research — known `react-native-web` limitation): Complete's confirmation silently did nothing in the browser. Replaced every `Alert.alert()` call in `QueueScreen.js` with an inline confirm panel and inline per-card error line.
4. Duplicate screen name "Home" on both the outer Stack and inner Tab navigator. Renamed the outer Stack screen to "Main"; updated `SignInScreen.js`'s explicit navigation target to match. Verified by signing out and back in.

## Process Decision This Session — THINK / FAST convention
Established for all future sessions: say **THINK** before any Go Ahead, during planning/design discussion, so reasoning gets full attention. Say **FAST** once Go Ahead is given, so execution stays mechanical and quick. **THINK** again before closing a session or utility, so wrap-up gets the same care. Claude is responsible for flagging these switches itself.

## Decisions Made or Changed
- Reschedule view names confirmed: "Sorted" (tabbed) and "Stacked" (grouped)
- View choice (Sorted/Stacked) is session-only for now, resets on app reopen

## Known Bug — Not Yet Fixed
Date/time extraction is missing explicit times in some phrasings. "Create a presentation for CME review 7 am tomorrow" landed with due_date at 11:00 AM (the generic "tomorrow" fallback) instead of 7:00 AM. This is a U08 extraction issue, not a timezone/display bug — UTC-to-local-time conversion was specifically re-verified and is working correctly. The actual gap: explicit times stated *before* the relative day word ("7 am tomorrow") aren't being picked up, while the same kind of phrasing *after* the day word ("tomorrow at 5 a.m.") was already confirmed working in U08. Needs a focused fix to U08's extraction logic — affects what's stored, what shows on Queue cards, and will affect U12's notification timing if not fixed first.

## Open Items
1. Ideas screen still not built — `promoteIdeaToCommitment()` remains unverified until it exists
2. D016 (reschedule-limit warning, system-enforced closure after 3 reschedules) not implemented — `reschedule_count` is tracked but unused
3. Date/time extraction bug described above
4. D013 (clarification questions) still not implemented
5. View choice does not persist across app restarts
6. None of this session's work committed to GitHub yet

## Next Session Starts With
Recommend fixing the date/time extraction bug first — small, isolated to U08, currently producing visibly wrong due times. After that: Ideas screen (verifying U10), then D016 enforcement.