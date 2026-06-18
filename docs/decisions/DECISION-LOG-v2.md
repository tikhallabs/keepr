# KEEPR — Decision Log v2
**Company:** Tikhal Labs
**Status:** Living document — update when any decision changes
**Last Updated:** 2026-06-15 (Session 003)

This file is the single source of truth for all product decisions.
No code shall contradict any decision below. If a build decision conflicts
with any of these, flag it before writing a single line of code.

---

## THE 26 DECISIONS

**D001 — Primary User**
Founders, Business Owners, Consultants, Managers, CXOs. MVP designed for people managing many commitments across multiple areas of life and work.

**D002 — Product Type**
Keepr is an AI-Powered Commitment Operating System. Not a task manager, reminder app or calendar.

**D003 — AI Philosophy**
Use AI only where necessary. Rules engine and database-driven workflows preferred over AI to reduce cost and increase reliability.

**D004 — Phase 1 Capture Channels**
MVP supports Voice, Manual Text and Camera/OCR. Future: Email, Calendar, WhatsApp, Excel, Sheets.

**D005 — Reminder Philosophy**
Reminders are persistent until acknowledged. Commitments do not silently disappear.

**D006 — Voice Strategy**
Voice is a universal input layer — not a feature of specific screens. Every screen carries a persistent floating mic button. Voice is never more than one tap away. Users capture commitments and ideas naturally through speech from anywhere in the app.
- Trigger phrase: user's personal wake phrase (set during First Time Setup)
- "Hey [wake phrase], I have an idea..." → routes to Idea object automatically
- "[wake phrase] + commitment language..." → routes to Commitment automatically
- Ambiguous input → AI asks ONE clarifying question (uses 1 of the 2-question budget)

**D007 — Data Relationships**
Commitments support relationships with People, Projects, Areas and Contexts for future intelligence.

**D008 — Hierarchy Structure**
Area → Context → Project → Commitment. Organization without mandatory entry during capture.

**D009 — Primary Home Screen**
Morning Briefing is the primary home screen. Not a task list.

**D010 — OCR Processing Flow**
Photo → OCR → AI Understanding → Categorization → User Validation → Save.

**D011 — MVP Scope**
Single User Only. Architecture must remain extensible for teams and delegation.

**D012 — Premium Vision**
Long-term: AI Chief of Staff answering questions about neglected commitments, broken promises, slipping projects.

**D013 — Incomplete Commitment Handling**
AI may ask maximum 2 clarification questions total (shared budget across all clarification needs including Commitment vs Idea routing). If still incomplete: save as Incomplete, remind after 30 minutes, surface in Daily Briefing.
The status a record receives at the moment of capture depends on what was extracted: a Commitment with an extracted due date starts as "scheduled." A Commitment with no due date starts as "unscheduled." An Idea always starts as "incomplete." NOTE: this supersedes an earlier statement in SESSION-005 that all captures default to "incomplete" — that earlier statement is no longer accurate and should not be followed.

**D014 — Reminder Persistence Model**
Hybrid Persistence. AI assigns default persistence levels. Users may override. Unresolved commitments keep appearing in briefings.

**D015 — Overdue Recovery Flow**
When overdue: mark overdue, immediately ask user to reschedule, complete or cancel. Recovery preferred over punishment.
The complete, exhaustive list of valid Commitment states is: incomplete, unscheduled, scheduled, overdue, completed, cancelled, closed (7 states). Ideas add one additional state: converted (used when promoted). No other state values are valid.

**D016 — Repeated Reschedule Policy**
After 3 reschedules: warn user. One final reminder cycle. Then System-Enforced Closure.
Specific mechanics: 3 free reschedules total. A warning is shown at the 2nd reschedule attempt ("1 attempt left"). A second warning is shown at the 3rd attempt ("This is the last attempt"). The 4th attempt is blocked entirely. Once blocked, a 7-CALENDAR-day (not working-day) auto-cancel countdown begins. Reschedule counting is uniform — it does not matter whether the commitment was in "scheduled" or "overdue" status when rescheduled, all reschedules count the same way.
Additionally: reschedule warnings are non-dismissible by design — the user cannot tap them away. (Regular, non-reschedule error messages remain dismissible as before.)

**D017 — Ambiguous Scheduling Handling**
Unclear scheduling: ask up to 2 clarification questions. If still unclear: save and route to incomplete/unscheduled queue.
When a user gives a date but no clock time, apply these defaults: "today" = 4 hours from now. "tomorrow" = 11:00 AM local. "day after tomorrow" = 11:00 AM local. "morning" = 10:00 AM local. "afternoon" = 2:00 PM local. Any time the user explicitly states always overrides these defaults.

**D018 — Unscheduled Commitment Queue**
Commitments lacking scheduling info go to dedicated Unscheduled Queue. Reviewed in briefings.

**D019 — Completion Notes Flow**
On completion: ask for notes. If yes: capture up to 100 words. If no: store "No Comment."

**D020 — Reopen Policy**
Completed commitments reopenable within 7 days. Full audit history preserved and never overwritten.
The complete, exhaustive list of valid Commitment states is: incomplete, unscheduled, scheduled, overdue, completed, cancelled, closed (7 states). Ideas add one additional state: converted (used when promoted). No other state values are valid.

**D021 — People Entity Strategy**
People are first-class entities. AI extracts names automatically. User can confirm, correct and merge.

**D022 — Person Dashboard Strategy**
MVP stores people relationships. No dedicated Person Dashboard screens in MVP. Data preserved for future.

**D023 — Universal Record Model (UPDATED)**
Two object types exist in the system: Commitment and Idea.
- Commitment: promise, request, obligation, follow-up, personal intention — has full lifecycle
- Idea: a thought, observation or creative input — sits in Ideas queue, no reminders unless converted
- An Idea can be promoted to a Commitment at any time — it then inherits the full commitment lifecycle from that point
- Both share the same database table with an object_type field
- Ideas have a storage limit per user tier (monetisation hook for post-MVP)
- The AI may silently reclassify a submitted Commitment down to an Idea if it determines that's the correct type. The user is shown a brief on-screen notice, but is not asked for permission first.
- Promoting an Idea to a Commitment creates a brand-new commitment row. The original idea row is NOT converted in place — it is marked status "converted" and stores a pointer to the new commitment row. The two rows remain separate but linked.
- Idea promotion is strictly one-to-one for MVP. One idea can only become one commitment. The idea of one idea spawning multiple commitments is explicitly parked as post-MVP and requires its own future decision-log entry before any code is written.
- When an idea is promoted, the new commitment inherits the idea's title and body text, and starts with status "unscheduled" (not "incomplete").

**D024 — Morning Briefing Priority**
Top section of Morning Briefing is an AI Executive Summary explaining what deserves attention, not just a list.

**D025 — Morning Headline Logic**
Single headline insight focuses on the most important overdue commitment. Simple and explainable for MVP.

**D026 — First Time Setup**
Every new user completes a mandatory 5-screen setup before using the app:
- Screen 1: Welcome ("Let's set you up in 60 seconds")
- Screen 2: Name ("What should Keepr call you?")
- Screen 3: Personal Wake Phrase (max 5 words, their choice, shown examples)
- Screen 4: Timezone (auto-detected, user confirms or changes)
- Screen 5: Ready (one practice voice capture to build muscle memory)
The wake phrase is stored in the user profile and used as the universal voice trigger across the entire app.
Always-on wake word detection is Post-MVP. MVP requires app open + mic tap to activate.

**D027 — Password Rules**
MVP passwords must be 4-15 characters. No complexity requirements (no mandatory uppercase, numbers, or symbols).

**D028 — Mobile Password Reset**
Users who signed up with a phone number cannot self-serve reset their password in MVP. They must email support. Only email-account users get self-serve password reset.

**D029 — Camera Privacy Rule**
The app must never use a custom in-app camera screen that stays open in the background. It must always use the device's native image picker. This is a trust and privacy principle, not a technical workaround.

**D030 — Timezone Display Rule**
When showing a due date or sending a notification, always use the device's CURRENT timezone at that moment, never the timezone saved during First Time Setup (D026). This matters for users who travel.

**D031 — Forbidden State Transitions**
"Scheduled" can never move back to "unscheduled" — unscheduled is a one-way entry state only. Terminal states (closed, cancelled, converted) block ALL further state changes; the app must direct the user to create a new commitment instead.

**D032 — Queue View Default**
The Queue always opens in Stacked view on app launch. The Sorted/Stacked toggle choice is session-only and does not persist across app restarts. This is an intentional product decision, not a gap to fill later.

---

## THE 6 PRINCIPLES

**P001 — Capture First, Organize Later**
Never block commitment capture because information is incomplete. Capture immediately, enrich later.
The status a record receives at the moment of capture depends on what was extracted: a Commitment with an extracted due date starts as "scheduled." A Commitment with no due date starts as "unscheduled." An Idea always starts as "incomplete." NOTE: this supersedes an earlier statement in SESSION-005 that all captures default to "incomplete" — that earlier statement is no longer accurate and should not be followed.

**P002 — Never Lose a Commitment**
Commitments move through states and queues. They never disappear.

**P003 — Preserve History**
Record state transitions, never delete records. Audit history is a core product asset.

**P004 — Simplicity Before Intelligence**
For MVP: simple explainable rules before advanced AI reasoning.

**P005 — Data Model Ahead of UI**
Store rich structured data from Day 1. Delay advanced dashboards until validated by users.

**P006 — Build Now, Learn From Users**
Discovery is complete for MVP. Remaining decisions driven by real user behavior.

---

## DECISION CHANGE LOG

| Date | Decision | Change | Session |
|---|---|---|---|
| 2026-06-15 | D023 | Added Idea object type, shared table with Commitment | Pre-build |
| 2026-06-15 | D006 | Expanded — voice everywhere + wake phrase mechanism | Pre-build |
| 2026-06-15 | D026 | Added — First Time Setup 5-screen flow defined | Pre-build |

*No decisions changed during U01 or U02 build sessions.*