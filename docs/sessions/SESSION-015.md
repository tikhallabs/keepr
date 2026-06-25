# KEEPR — Session 015 — June 2026

## Utility Worked On
U12 — Notification Engine (Firebase FCM)

## Status at Session End
Complete — committed to GitHub

## What Was Built
Full notification engine wired into Keepr:
- Firebase project created (Tikhal-Keepr, Spark plan, free)
- Android app registered with package name com.tikhallabs.keepr
- google-services.json downloaded and placed in project root
- All required packages installed
- app.config.js updated with package name, config file reference, and plugins
- firebase.json created with Android notification channel ID
- fcmService.js — FCM token retrieval, Supabase storage, refresh listener
- notificationScheduler.js — 4-query polling engine every 5 minutes
- Supabase users table updated with fcm_token and fcm_token_updated_at columns
- Both services wired into App.js and AppNavigator.js

## Files Created or Modified
- google-services.json (new — project root)
- firebase.json (new — project root)
- app.config.js (modified)
- src/services/fcmService.js (new)
- src/services/notificationScheduler.js (new)
- App.js (modified)
- src/navigation/AppNavigator.js (modified)

## Decisions Confirmed or Applied
- D005 — Reminders persistent until acknowledged
- D013 — Incomplete commitments surfaced after 30 minutes
- D014 — Hybrid persistence model
- D016 — 3-reschedule warning implemented in scheduler
- D023 — records table used (not commitments), object_type='commitment' filter applied

## Schema Changes
ALTER TABLE users
  ADD COLUMN fcm_token text,
  ADD COLUMN fcm_token_updated_at timestamptz;

## Key Decisions Made This Session
- iOS notifications deferred to post-MVP (requires $99/year Apple Developer Account)
- expo-dev-client installed — Expo Go no longer works for this project
  Testing now requires: npx expo run:android with device connected via USB
- Option A chosen: build U12 fully now, test actual device delivery in U17
- notifee deduplication uses in-memory Set (firedThisSession) — no DB migration needed for MVP
- Token refresh handled automatically by setupTokenRefreshListener()

## What Is NOT Tested Yet
- Actual notification delivery to a real device (requires APK — tested in U17)
- FCM remote push when app is closed (requires backend trigger — post-MVP)

## Open Items
- android.package must be added to app.config.js before U17 APK build
  (Claude Code confirmed it was added this session — verify before U17)

## Next Session Starts With
U13 — Morning Briefing
First step: plan the Morning Briefing screen — AI Executive Summary as primary home screen (D009, D024, D025)