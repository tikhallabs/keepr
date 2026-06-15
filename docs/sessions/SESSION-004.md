# KEEPR — Session 004 — [DATE]

## Utility Worked On
U04 — Authentication

## Status at Session End
Complete ✅

## What Was Built
- Auth Gate screen (Choose Sign Up or Sign In)
- Sign Up screen (Email or Mobile toggle, full validation)
- Sign In screen (Email or Mobile toggle)
- Forgot Password screen (email reset via Supabase, manual support for mobile)
- Placeholder Home screen (post-login landing until U13)
- AppNavigator — root navigator controlling auth vs app flow
- RLS policies added to users table (insert, select, update)
- Email confirmation turned OFF in Supabase (MVP testing mode)
- Full flow tested: Sign Up → Onboarding → Sign In → Home → Sign Out

## Files Created or Modified
- src/screens/auth/AuthGateScreen.js — New
- src/screens/auth/SignUpScreen.js — New
- src/screens/auth/SignInScreen.js — New
- src/screens/auth/ForgotPasswordScreen.js — New
- src/screens/HomeScreen.js — New (placeholder)
- src/navigation/AppNavigator.js — New (root navigator)
- src/constants/theme.js — Added borderRadius as alias for radius
- App.js — Updated to use AppNavigator

## Decisions Confirmed This Session
- Mobile login stored as 91XXXXXXXXXX@keepr.app internally in Supabase Auth
- Password: 4–15 characters, no complexity rules for MVP
- Email reset works via Supabase. Mobile reset is manual for MVP (support email)
- Email confirmation OFF for MVP testing

## Parking Lot Items Added
- SMS OTP verification for mobile signup
- Self-serve password reset for mobile users
- Google login
- Apple login
- International phone codes
- Email verification on signup

## Issues Encountered
- borderRadius not exported from theme.js — fixed by adding alias
- Nested navigator conflict — resolved by flattening all screens into AppNavigator
- RLS blocked users table insert — fixed by adding RLS policies via SQL Editor
- Email rate limit hit during testing — resolved by disabling email confirmation
- Orphaned auth user from failed first attempt — deleted manually from Supabase dashboard

## Open Items
- shadow* deprecation warnings on web — minor, fix in later polish pass
- Onboarding flow (U02) launches after Sign Up but wake phrase not yet saved to users table — this will be wired up properly in a dedicated session

## Next Session Starts With
U05 — Manual Text Capture
First step: Design the capture flow before writing any code