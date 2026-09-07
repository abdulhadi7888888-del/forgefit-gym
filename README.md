# ForgeFit Gym

## Setup
1. `npm install`
2. `.env` is already filled in with your `forgefit-gym` Firebase project config — no action needed unless it changes. **Keep `.env` out of git** (`.gitignore` already excludes it).
3. In Firebase Console, enable Authentication providers: Email/Password, Google, Apple, Anonymous
4. Deploy security rules: `firebase deploy --only firestore:rules` (uses `firestore.rules`)
5. Deploy the required Firestore composite index: `firebase deploy --only firestore:indexes` (uses `firestore.indexes.json`) — **without this, the Home dashboard and Profile/History pages will hang on "Loading..." forever**, because `getRecentSessions()` filters by `status` and sorts by `startedAt`, which needs a composite index.
5. Seed the exercise library once: download a service account key into `scripts/serviceAccountKey.json`, then `node scripts/seedExercises.js`
6. Grant yourself admin: `node scripts/makeAdmin.js <your-uid>` (find your uid in Firebase Console → Authentication)
7. Deploy Cloud Functions: `cd functions && npm install && firebase deploy --only functions`
8. Set the AI Coach's LLM key as a secret (never in client code): `firebase functions:secrets:set ANTHROPIC_API_KEY`
8b. For native subscription purchases, set the receipt-verification secrets: `firebase functions:secrets:set APPLE_SHARED_SECRET`, `firebase functions:secrets:set GOOGLE_PLAY_SERVICE_ACCOUNT` (paste the full service-account JSON as one line), `firebase functions:secrets:set ANDROID_PACKAGE_NAME`
9. For push notifications: generate a Web Push VAPID key (Firebase Console → Project Settings → Cloud Messaging) and add it to `.env` as `VITE_FIREBASE_VAPID_KEY`
10. `npm run dev` to run locally, `npm run build` to produce a deployable `dist/` folder

## Deploy (web / installable PWA)
`npm run build` then deploy `dist/` to Firebase Hosting, Vercel, or Netlify. The PWA manifest lets users "Add to Home Screen" on iOS and Android for an app-like experience without app store review — a real native build is a separate step (see below).

## Native iOS / Android
This is a web app. To ship to the App Store / Play Store as a native app, wrap it with Capacitor:
```
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add ios
npx cap add android
npm run build && npx cap sync
```
Then open the generated `ios/` project in Xcode / `android/` project in Android Studio to build, sign, and submit — this step needs a Mac (for iOS) and your own Apple Developer / Google Play accounts.

For subscriptions, also add a Capacitor in-app-purchase plugin (e.g. `@capacitor-community/in-app-purchases` or RevenueCat's Capacitor SDK) — `src/pages/Subscription.jsx` is written to call that plugin's purchase method and pass the resulting receipt/token to `verifySubscription`, but the plugin itself isn't wired in yet since it only works in a native build, not this web-only sandbox.

## What's implemented so far
- Real Firebase Auth: email/password, Google, Apple, guest, password reset, email verification
- Onboarding writes to `/profiles/{uid}`
- Auto-generated weekly plan from profile (goal, days/week, equipment) written to `/workoutPlans`
- Home dashboard: today's workout, real streak/volume/PR stats, 7-day chart — all computed from Firestore
- Exercise library (159 real named exercises across every major muscle group and equipment type; seed script + admin panel provided to grow toward the full 500) with search/filter
- Exercise detail page with real per-exercise history and PR pulled from Firestore
- Active workout screen: real set logging, rest timer, automatic PR detection, session totals
- Progress page: real body-weight chart, real volume chart, 1RM calculator, PR list — Recharts fed entirely by Firestore queries
- Body measurements: chest/waist/arms/thighs/shoulders/body-fat% tracked separately from body weight, with a per-metric chart and history list (`/measurements`, linked from Progress)
- Smart Workout Generator (`/workout-generator`, linked from the workout builder): pick goal/level/days/equipment, generate a real plan from `generatePlan`, preview week 1, Regenerate (reshuffles exercise picks), Edit Manually (hands off to the builder), or Save Plan (writes it as a custom plan)
- Profile page with real lifetime stats and sign-out
- Custom workout builder: create/edit/reorder/duplicate/delete/activate plans, from scratch or templates (Push/Pull/Legs/etc.)
- Custom exercises: user-created exercises saved to a private library, usable in the builder — name, muscle, equipment, difficulty, instructions, notes, optional image/video URL
- Workout history: real completed sessions grouped by month, expandable detail
- Cardio tracker: manual logging (type, duration, distance, calories) with history
- Favorites: star exercises/plans, saved to Firestore, listed on their own page
- Body muscle map: tappable front/back regions (original CSS shapes, no copyrighted art) linking to exercises per muscle
- Notification preferences: per-type on/off toggles saved to Firestore
- AI Coach: real chat backed by a Cloud Function that pulls your actual profile, active plan, recent sessions, and PRs and sends them as context to an LLM — not canned responses. Requires `ANTHROPIC_API_KEY` secret (step 8).
- Admin panel: dashboard, exercise CRUD (writes to the real public library), user list, and a notification broadcast tool — gated by a real `/admins/{uid}` Firestore doc, not a client-side flag
- Cloud Functions: `verifySubscription` (Apple/Google receipt verification stub — see below), `onPersonalRecord` (auto-notifies on a new PR), `missedWorkoutCheck` (daily scheduled reminder), `askCoach` (AI coach backend)
- Subscription page: reads real status from `subscriptions/{uid}` live (onSnapshot); purchase buttons call the real `verifySubscription` function and correctly refuse to fake premium on web (native purchase flow required — see below)
- Exercise video/image player: real HTML5 controls (play/pause/mute/seek/fullscreen/speed 0.5x–2x), only renders when a real media URL is present — no placeholder video
- Exercise detail page has real Overview / Instructions / Tips / History tabs instead of one long scroll
- Offline mode: Firestore's IndexedDB persistence is enabled at boot, so starting a workout, logging sets, and finishing a session all work with no connection and queue locally; a real online/offline banner shows status and confirms once queued writes finish syncing (`waitForPendingWrites`)
- Push notifications: real FCM wiring — client requests permission and registers a token (`src/lib/push.js` + `public/firebase-messaging-sw.js`), tokens are stored per-user, and `onPersonalRecord`/`missedWorkoutCheck` Cloud Functions send actual pushes (with dead-token cleanup) in addition to the in-app notification doc
- Analytics: real events (`app_opened`, `workout_started`, `workout_completed`, `exercise_viewed`, `exercise_searched`, `subscription_started`) sent via Firebase Analytics using your project's measurementId
- Accessibility pass: focus-visible outlines, `prefers-reduced-motion` support, `aria-label`s on icon-only buttons, `aria-current` on the active tab
- Marketing website (`landing/index.html`, separate static file, deploy anywhere): hero, features, and real 3-tier pricing (Monthly Rs 8,000 / 6-Month Rs 30,000 / 12-Month Rs 48,000) with the discount math shown — Free plan links to `/login`, paid plans open WhatsApp with a prefilled message
- Real lock/renew subscription lifecycle: `subscriptions/{uid}.expiresAt` is the single source of truth. `adminActivateSubscription` (admin panel → Activate subscription) sets it after a WhatsApp/bank slip is manually verified; `checkExpiredSubscriptions` runs daily and flips expired accounts back to free automatically; `PremiumGuard` on the client locks premium routes (AI Coach) the moment that happens and shows a Renew CTA
- Auto-admin: `abdulhadi7888888@gmail.com` is hardcoded in `functions/index.js` (`ADMIN_EMAILS`) — the moment an account with that email signs up (via Google or any method), a Cloud Function grants it `/admins/{uid}` and a never-expiring premium subscription automatically. Every premium feature (AI Coach, admin panel, etc.) is free for that account everywhere, permanently — `PremiumGuard` and the Subscription page both check the real `role: admin` field, not a client-side flag

## Not yet built (next steps)
- Cardio + HealthKit/Health Connect device sync — real device sync needs a native Capacitor build (see below); `src/lib/healthSync.js` now ships the Capacitor plugin bridge and merge logic so this is a drop-in once the app is wrapped natively
- Exercise photos/videos (needs licensed or self-produced media — admin panel has fields ready for URLs once you have them)
- Native builds via Capacitor (see above) and app store submission
- Push notifications need one more setup step: generate a VAPID key (Firebase Console → Project Settings → Cloud Messaging → Web Push certificates) and add it as `VITE_FIREBASE_VAPID_KEY` in `.env`
- Full accessibility audit with a screen reader (current pass covers focus states, reduced motion, and the most common icon-only buttons, but hasn't been tested with VoiceOver/TalkBack end to end)

## Recently completed
- Real Apple/Google receipt verification: `verifyAppleReceipt` calls Apple's `verifyReceipt` (prod, falling back to sandbox on status 21007) and `verifyGooglePurchase` calls the Android Publisher API via a service account — both replace the old stubs that just threw `unimplemented`. Needs the `APPLE_SHARED_SECRET`, `GOOGLE_PLAY_SERVICE_ACCOUNT`, and `ANDROID_PACKAGE_NAME` secrets (step 8b above)
- Offline conflict resolution: `src/lib/offline.js` now timestamps every local write and resolves conflicts with last-write-wins by client timestamp (not just Firestore's default "last write to reach the server wins"), plus a queued-writes count so the offline banner can show "3 changes pending" instead of a flat on/off state


## Exercise library update
- 500+ searchable exercise entries
- Search by exercise, muscle, equipment
- Equipment and difficulty filters
- Per-exercise form instructions
- Media remains optional and should be uploaded/licensed by the app owner
