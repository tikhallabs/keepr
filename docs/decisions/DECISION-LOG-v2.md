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

**D014 — Reminder Persistence Model**
Hybrid Persistence. AI assigns default persistence levels. Users may override. Unresolved commitments keep appearing in briefings.

**D015 — Overdue Recovery Flow**
When overdue: mark overdue, immediately ask user to reschedule, complete or cancel. Recovery preferred over punishment.

**D016 — Repeated Reschedule Policy**
After 3 reschedules: warn user. One final reminder cycle. Then System-Enforced Closure.

**D017 — Ambiguous Scheduling Handling**
Unclear scheduling: ask up to 2 clarification questions. If still unclear: save and route to incomplete/unscheduled queue.

**D018 — Unscheduled Commitment Queue**
Commitments lacking scheduling info go to dedicated Unscheduled Queue. Reviewed in briefings.

**D019 — Completion Notes Flow**
On completion: ask for notes. If yes: capture up to 100 words. If no: store "No Comment."

**D020 — Reopen Policy**
Completed commitments reopenable within 7 days. Full audit history preserved and never overwritten.

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

---

## THE 6 PRINCIPLES

**P001 — Capture First, Organize Later**
Never block commitment capture because information is incomplete. Capture immediately, enrich later.

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