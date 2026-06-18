# KEEPR — Session 012 — 2026-06-18

## Utility Worked On
U08 (bug fix), U09 (full verification + production bug fix), U10 (Idea Engine — completed for MVP), U11 (Queue System — D016 Repeated Reschedule Policy completed)

## Status at Session End
U08 — Complete (fix verified)
U09 — Complete (fully verified, one real bug found and fixed)
U10 — Complete for MVP scope
U11 — Complete

## What Was Built

**U08 fix** — `aiService.js`: system prompt rewritten so an exact stated time (e.g. "7am") always overrides the default time rules when combined with a relative day word (e.g. "tomorrow"), instead of falling back to the generic default. Added three few-shot examples. Verified across 4 phrasing variants including the originally-broken "time before day word" order.

**U09 fix** — Found via code review (not previously known): the `flip_overdue_commitments()` Postgres function (built in an earlier session) never set `user_id` on its `record_audit` insert. Since it runs via `pg_cron` with no `auth.uid()` context, and the RLS policy requires `auth.uid() = user_id`, every overdue-transition audit row was being silently rejected — `NULL = NULL` evaluates to `NULL`, not `true`, in Postgres. Confirmed via direct query (`SELECT * FROM record_audit WHERE change_reason = 'overdue_detected'` returned zero rows despite the cron having flipped statuses). Fixed by having the function look up and include each record's actual `user_id`. Also added `updated_at` to the UPDATE for consistency with every other transition in the app. Ran a one-time backfill query for any existing un-audited overdue rows — confirmed zero rows needed it (no overdue records existed at the time of the check).

**U10 build** — `IdeasScreen.js` rewritten from a stub into a working screen: fetches all `object_type = 'idea'` records, tap-to-expand cards show full body text, open ideas show a "Promote to Commitment" button with inline Yes/No confirm (matching the same pattern as `QueueScreen.js`), already-converted ideas show a "Converted" flag instead. `statusMeta.js` extended with a `converted` entry (kept out of `STATUS_ORDER` since that array is Queue-specific). Also fixed two real bugs in `ideaService.js`'s `promoteIdeaToCommitment()`: it was creating new commitments with blank title/body (never carried the idea's content over) and hardcoding status to `incomplete` instead of the D018-correct `unscheduled`. Both fixed and verified — promoted commitments now show correct content under Unscheduled.

**U11 — D016 build** — Repeated Reschedule Policy fully implemented: every reschedule now counts (previously only overdue→scheduled transitions incremented the counter, missing the common already-scheduled reschedule case entirely). Warning shown at the 2nd reschedule ("1 attempt left"), at the 3rd ("This is the last attempt"), and the 4th attempt is blocked with a final message and starts a 7-calendar-day auto-cancel countdown, displayed live on the card ("X days left to cancel"). A new hourly cron job auto-cancels anything left unresolved after 7 days. Reschedule warnings were made non-dismissible (separate state from genuine errors, which remain dismissible) per explicit instruction.

## Code Written This Session

### `services/aiService.js` (U08)
Replaced the `due_date` rules block in `SYSTEM_PROMPT` — added an explicit "exact time always overrides defaults" rule plus three few-shot examples, ahead of the existing default-time rules.

### SQL — overdue cron fix (U09)
```sql
CREATE OR REPLACE FUNCTION flip_overdue_commitments()
RETURNS void AS $$
BEGIN
  INSERT INTO record_audit (record_id, user_id, from_status, to_status, changed_at, change_reason)
  SELECT id, user_id, 'scheduled', 'overdue', now(), 'overdue_detected'
  FROM records
  WHERE status = 'scheduled' AND due_date < now();

  UPDATE records
  SET status = 'overdue', updated_at = now()
  WHERE status = 'scheduled' AND due_date < now();
END;
$$ LANGUAGE plpgsql;

INSERT INTO record_audit (record_id, user_id, from_status, to_status, changed_at, change_reason, notes)
SELECT r.id, r.user_id, 'scheduled', 'overdue', r.updated_at, 'overdue_detected', 'Backfilled - exact transition time unknown'
FROM records r
WHERE r.status = 'overdue'
AND NOT EXISTS (
  SELECT 1 FROM record_audit a
  WHERE a.record_id = r.id AND a.to_status = 'overdue'
);
```

### `constants/statusMeta.js` (U10)
Added `converted: { label: 'Converted', color: '#2F855A', bg: '#E6F4EA' }` to `STATUS_META`. `STATUS_ORDER` left unchanged (Queue-only).

### `services/ideaService.js` (U10 fix)
Changed the idea fetch to also select `title, body`. Changed `createRecord()` call inside `promoteIdeaToCommitment()` to pass `title: idea.title, body: idea.body, status: 'unscheduled'` instead of blank body + hardcoded `incomplete`.

### `screens/IdeasScreen.js` (U10 — full rewrite)
Full working screen: idea list, tap-to-expand with full body, Promote action with inline confirm, Converted flag. (Full file given in chat this session — not reproduced here, already in repo.)

### SQL — D016 auto-cancel (U11)
```sql
ALTER TABLE records ADD COLUMN closure_warning_started_at timestamptz;

CREATE OR REPLACE FUNCTION auto_cancel_unresolved_commitments()
RETURNS void AS $$
BEGIN
  INSERT INTO record_audit (record_id, user_id, from_status, to_status, changed_at, change_reason, notes)
  SELECT id, user_id, status, 'cancelled', now(), 'system_auto_cancel', 'Auto-cancelled after 7 days of no action (D016)'
  FROM records
  WHERE closure_warning_started_at IS NOT NULL
    AND status NOT IN ('completed', 'cancelled', 'closed', 'converted')
    AND closure_warning_started_at < now() - interval '7 days';

  UPDATE records
  SET status = 'cancelled', updated_at = now()
  WHERE closure_warning_started_at IS NOT NULL
    AND status NOT IN ('completed', 'cancelled', 'closed', 'converted')
    AND closure_warning_started_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

SELECT cron.schedule('auto-cancel-unresolved-commitments', '0 * * * *', 'SELECT auto_cancel_unresolved_commitments();');
```

### `services/lifecycleService.js` (U11)
Removed the old, partial `reschedule_count` increment block from `transitionRecord()`. Added new exported function `rescheduleRecord(recordId, fromStatus, newDueDate)` — single entry point for all reschedules, handles counting, the 2nd/3rd warnings, and the 4th-attempt block + `closure_warning_started_at` write. (Full function given in chat this session — already in repo.)

### `screens/QueueScreen.js` (U11)
Swapped `updateDueDate`/`transitionRecord` import for `rescheduleRecord`. Rewrote `applyReschedule()` to call it and branch on `result.success` / `result.finalWarning`. Added `getDaysLeftText()` helper and countdown text on the card driven by `item.closure_warning_started_at`. Added separate `warningById` state (non-dismissible) split out from `errorById` (still dismissible), with new `inlineWarning` style.

## Decisions Made or Changed

No official numbered decision (D001–D026) was altered. New implementation-level decisions locked this session:

- **D016 specifics locked:** 3 free reschedules total. Warning at 2nd ("1 attempt left"), warning at 3rd ("This is the last attempt"), block + final message at 4th attempt. Auto-cancel countdown = 7 **calendar** days (not working days) from the moment of block. Reschedule counting applies uniformly regardless of starting status (scheduled or overdue) — fixes a prior gap where only overdue→scheduled counted.
- **Reschedule warnings are non-dismissible by design** — separated from genuine error messages, which remain dismissible as before.
- **View mode persistence (Sorted/Stacked) — explicitly decided NOT to build.** Always defaults to Stacked. Confirmed intentional, not a gap.
- **Idea promotion stays strictly 1:1 for MVP** (one idea → exactly one commitment). A real future need was identified — an idea producing multiple distinct commitments (e.g. "Start a Pooja Brand Company" spawning research, vendor calls, pricing checks, etc. as separate commitments) — and three possible destinations were discussed: stay as a simple 1:1 promotion, become a new Project (reusing the existing but unbuilt D008 Area→Context→Project→Commitment hierarchy and the unused `project_id` column), or attach to an existing Area/Context bucket unrelated to "project-ness" (e.g. a Europe trip idea living under a "Family" bucket rather than becoming its own Project). **Explicitly parked for post-MVP** — this needs its own properly scoped future utility and a new decision-log entry before any schema or code work begins, not a quick addition to U10.

## Open Items

1. D013 — clarification questions (max 2 budget) — still fully unimplemented, carried forward from before this session.
2. U10 — `auditWarning` branch in `promoteIdeaToCommitment` (audit-log failure during promotion) — untested.
3. U10 — ideas captured via voice or OCR (not just typed text) — untested through the promote/Ideas-screen flow.
4. Future utility (unnumbered) — Idea destination choice (simple / new Project / existing Area-Context bucket) — parked post-MVP, see Decisions above.
5. U12 dependency — once Notification Engine exists, its "remind me later" snooze must feed into `rescheduleRecord()`'s counting, not a separate mechanism.
6. View mode persistence — intentionally not built (see Decisions above), not an open bug.

## Next Session Starts With
Decide what's next: U12 (Notification Engine, next in original build order) vs. D013 (clarification questions, older open item) vs. something else — needs the user's input before proceeding.