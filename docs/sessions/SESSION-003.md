# KEEPR — Session 003 — [DATE]

## Utility Worked On
U03 — Database Schema + Supabase Connection

## Status at Session End
Complete ✅

## What Was Built
- Supabase project created (Region: South Asia — Mumbai, ap-south-1)
- 7 tables created via SQL Editor in one script
- Supabase JS SDK installed and configured
- Environment variables set up in .env (protected by .gitignore)
- Supabase connection verified: SUCCESS log confirmed in browser console
- Test code removed, App.js restored to clean state
- All committed to GitHub

## Files Created or Modified
- src/services/supabase.js — Supabase client initialisation
- .env — Supabase URL + anon key (NOT committed to GitHub)
- .gitignore — Added .env explicitly
- App.js — Temporarily modified for connection test, then restored

## Tables Built
| Table | Purpose |
|---|---|
| users | User profile, wake phrase, timezone |
| areas | Top level of hierarchy |
| projects | Lives inside areas |
| people | First-class people entities |
| records | Commitments + Ideas (object_type field separates them) |
| record_audit | Full state change history, never deleted |
| record_people | Junction table linking records to people |

## Decisions Confirmed This Session
- D023: Two object types (Commitment + Idea) in one table confirmed in schema
- D020 + P003: Audit trail table built, no delete pattern enforced
- D011: Single user MVP architecture, extensible for teams
- D007 + D008: Hierarchy and people relationships built into schema

## Issues Encountered
- Supabase free tier limits to 2 active projects — resolved by pausing whatsapp-monitor project
- Stray character S in ReadyScreen.js caused white screen — fixed before connection test
- PowerShell terminal quirk with git add . — resolved by opening fresh terminal

## Open Items
- RLS policies not yet configured (tables created with RLS on but no policies written yet — handled in U04)
- .env file exists locally only — never to be committed to GitHub

## Next Session Starts With
U04 — Authentication
First step: Design the Auth flow (Sign Up + Sign In) before writing any code