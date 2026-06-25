# Keepr — Project Context for Claude Code

**Company:** Tikhal Labs
**Product:** Keepr — AI-Powered Commitment Operating System (not a task manager, reminder app, or calendar)
**GitHub:** https://github.com/tikhallabs/keepr
**Builder is a non-coder.** Explain every command/concept in plain English before running it. One step at a time. Confirm before moving to the next step. Never assume — ask.

## Stack (locked — flag before suggesting any change)
Expo (React Native, mobile-first, web via Expo Web later) + Node.js + Supabase (Postgres + Auth) + Vercel + OpenAI API (Whisper + GPT-4o-mini) + Firebase FCM. Free tiers only until explicitly approved otherwise.

@AGENTS.md
(imports the existing Expo SDK version-check reminder — do not remove this line)

## Where the real history lives
Don't ask the user to re-explain past work — read these first:
- `/docs/decisions/DECISION-LOG-v2.md` — the 32 product decisions (D001–D032) and 6 principles (P001–P006). Nothing built should contradict these. If a request seems to conflict with one, flag it before writing code.
- `/docs/sessions/SESSION-001.md` through `SESSION-015.md` — what was actually built, tested, and decided, session by session. Session numbers track sittings, not utilities 1:1 — a utility can span several sessions.
- `/docs/INDEX.md` — master utility status table.

## Utility status
| Utility | Status |
|---|---|
| U01–U07 | Complete (setup, first-time flow, schema, auth, manual/voice/OCR capture) |
| U08 — AI Understanding Engine | Complete (date/time extraction bug fixed Session 012) |
| U09 — Commitment Lifecycle Engine | Complete, fully re-verified (states, transitions, reopen, audit trail, overdue cron) |
| U10 — Idea Engine | Complete for MVP scope (IdeasScreen, promotion flow, verified) |
| U11 — Queue System | Complete (Sorted/Stacked views, full action layer, D016 reschedule-limit policy built & tested) |
| U12 — Notification Engine | Complete (Firebase FCM direct integration, local notifications via notifee, token persistence, scheduler) |
| U13 — Morning Briefing | Complete (AI headline, briefing data, pull-to-refresh; HomeScreen.js replaced) |
| U14–U17 | Not started |

## Testing requirement (from Session 015)
**Expo Go no longer works.** expo-dev-client is installed. All testing requires a USB-connected Android device and `npx expo run:android`. No exceptions.

## Open items carried into this session
1. D013 — clarification questions (max 2-question shared budget) — not implemented at all yet.
2. U10 — two untested edges: audit-log-failure branch in promotion flow, and ideas captured via voice/OCR rather than typed text.
3. Idea → destination choice (stay 1:1 / become a Project / attach to Area-Context) — explicitly parked, post-MVP. Do not build without a new Decision Log entry first.
4. U12 — "remind me later" snooze (when built) must call `rescheduleRecord()` from lifecycleService.js, not a separate mechanism.
5. View mode (Sorted/Stacked) does NOT persist across restarts — this is intentional, not a bug.

**Next utility:** U14 — People Entity System.

## Working conventions (carried over from prior planning sessions)
- Say **THINK** during planning/design discussion — Short explainable reasoning, options laid out, before any Go Ahead.
- Say **FAST** — mechanical, quick execution, no re-litigating the plan.
- Switch back to **THINK** before closing out a session or utility.
- Only "Go Ahead" / "Approved" authorize writing or changing code. "Looks good," "OK," silence, or a question are NOT confirmation.
- One question at a time. Never stack multiple questions in one response.
- Light theme only, never dark. Mobile-first. Persistent floating mic button on every screen (D006) — never remove it.
- Single user, MVP scope (D011) — do not build team/multi-user features.
- Don't build anything listed in the Parking Lot section of the Decision Log without explicit confirmation it's being pulled into MVP scope.

## When a new decision gets made mid-session
Add a short 2-3 line entry to `/docs/decisions/DECISION-LOG-v2.md` (what was decided, why) — don't just leave it in conversation. If it's a genuinely new numbered decision, follow the existing D0XX numbering convention.

## WORKING CONVENTIONS (How We Work — Not Product Decisions)

These are conventions about HOW Tikhal and Claude work together. They are NOT product decisions and do NOT belong in DECISION-LOG-v2.md.

### Workflow Split (Session 013)
- claude.ai (Tikhal-Builder) is used for: planning, teaching, decision-making, and reviewing what Claude Code produces. No code is written there.
- Claude Code (this tool) is used for: writing code, editing files, running commands — actual execution only.
- CLAUDE.md, DECISION-LOG-v2.md, and the /docs/sessions/ files are the ONLY bridge between these two tools. There is no automatic memory sharing — if something matters, it must be written into one of these files.

### THINK / FAST Mode (Session 011)
- THINK mode: used during planning, design, and any decision with real consequences. Full reasoning effort expected.
- FAST mode: used once a decision is approved and the task is purely mechanical/quick execution.
- Claude (in either tool) is responsible for noticing when a switch is warranted and flagging it — not just waiting to be told.
- Always switch back to THINK before closing out a session or finishing a utility.
