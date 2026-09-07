# Firestore Data Model — Fitness App

## Collections overview

```
/users/{uid}
/profiles/{uid}
/exercises/{exerciseId}
/customExercises/{uid}/items/{exerciseId}
/workoutPlans/{uid}/plans/{planId}
/workoutSessions/{uid}/sessions/{sessionId}
/exerciseLogs/{uid}/logs/{logId}
/personalRecords/{uid}/records/{exercise}
/bodyWeight/{uid}/entries/{entryId}
/measurements/{uid}/entries/{entryId}
/favorites/{uid}/items/{itemId}
/notifications/{uid}/items/{notificationId}
/subscriptions/{uid}
/admins/{uid}
```

Design principle: everything that is **private to one user** lives in a subcollection under that user's `uid`, so a single security rule pattern (`request.auth.uid == uid`) covers almost the whole app. `exercises` is the one global/public collection (admin-writable, everyone-readable).

---

## /users/{uid}
Created on signup (Firebase Auth mirror + account-level fields).

```ts
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string | null,
  authProvider: "password" | "google" | "apple" | "guest",
  createdAt: Timestamp,
  lastLoginAt: Timestamp,
  role: "user" | "admin",
  isPremium: boolean,           // mirrored from subscriptions for fast reads
  units: "kg" | "lb",
  theme: "dark" | "light" | "system"
}
```

## /profiles/{uid}
Onboarding data.

```ts
{
  name: string,
  gender: "male" | "female" | "other" | "prefer_not_to_say",
  age: number,
  heightCm: number,
  startingWeightKg: number,
  currentWeightKg: number,
  goalWeightKg: number | null,
  fitnessLevel: "beginner" | "intermediate" | "advanced",
  primaryGoal: "muscle_gain" | "fat_loss" | "strength" | "endurance" | "toning" | "general_fitness",
  trainingFrequency: 2|3|4|5|6|7,
  equipment: string[],   // ["full_gym","dumbbells","barbell","machines","cable","bands","bodyweight","home"]
  onboardingComplete: boolean
}
```

## /exercises/{exerciseId}  (public, admin-managed)

```ts
{
  slug: string,
  name: string,
  primaryMuscle: string,
  secondaryMuscles: string[],
  equipment: string,
  difficulty: "beginner" | "intermediate" | "advanced",
  instructions: string,
  steps: string[],
  mistakes: string[],
  safetyTips: string[],
  defaultSets: number,
  repRange: string,        // "8-12"
  restSeconds: number,
  imageUrl: string,           // legacy single-image fallback
  imageUrlStart: string,      // step 1 photo — start position (shown in Exercise detail)
  imageUrlEnd: string,        // step 2 photo — end position (shown in Exercise detail)
  videoUrl: string | null,
  createdBy: "system" | uid,   // "system" for the seeded 500, uid for admin additions
  updatedAt: Timestamp
}
```

## /customExercises/{uid}/items/{exerciseId}  (private, same shape as /exercises)
User-authored exercises, only visible to that user.

## /workoutPlans/{uid}/plans/{planId}

```ts
{
  name: string,
  goal: string,
  daysPerWeek: number,
  createdAt: Timestamp,
  schedule: [
    {
      day: "monday",
      name: "Chest & Triceps",
      exerciseIds: [
        { exerciseId: "bench-press", sets: 4, repRange: "8-10", restSeconds: 90 }
      ]
    }
  ],
  isActive: boolean
}
```

## /workoutSessions/{uid}/sessions/{sessionId}
One record per completed (or in-progress, for offline resume) workout.

```ts
{
  planId: string | null,
  dayName: string,             // "Chest & Triceps"
  startedAt: Timestamp,
  finishedAt: Timestamp | null,
  durationSeconds: number,
  status: "in_progress" | "completed",
  totalVolume: number,
  totalSets: number,
  caloriesEstimate: number,
  feeling: "bad" | "normal" | "good" | "excellent" | null,
  notes: string,
  syncedFromOffline: boolean
}
```

## /exerciseLogs/{uid}/logs/{logId}
One record per completed set (flat, so charts can query by date range without loading whole sessions).

```ts
{
  sessionId: string,
  exerciseId: string,
  exerciseName: string,
  setNumber: number,
  weightKg: number,
  reps: number,
  volume: number,          // weightKg * reps
  date: string,             // "YYYY-MM-DD" for cheap range queries
  timestamp: Timestamp
}
```

## /personalRecords/{uid}/records/{exerciseId}
Latest PR per exercise (overwritten on new PR; history kept via exerciseLogs).

```ts
{
  exerciseName: string,
  bestWeightKg: number,
  bestReps: number,
  estimated1RM: number,
  achievedAt: Timestamp,
  previousBestKg: number
}
```

## /bodyWeight/{uid}/entries/{entryId}

```ts
{ date: string, weightKg: number, timestamp: Timestamp }
```

## /measurements/{uid}/entries/{entryId}

```ts
{ date: string, chestCm: number|null, waistCm: number|null, armsCm: number|null,
  thighsCm: number|null, shouldersCm: number|null, bodyFatPct: number|null, timestamp: Timestamp }
```

## /favorites/{uid}/items/{itemId}
```ts
{ type: "exercise" | "workout" | "plan", refId: string, addedAt: Timestamp }
```

## /notifications/{uid}/items/{notificationId}
```ts
{ type: "reminder"|"pr"|"streak"|"weekly_summary", title: string, body: string, read: boolean, createdAt: Timestamp }
```

## /subscriptions/{uid}
```ts
{
  tier: "free" | "premium",
  platform: "ios" | "android" | "web" | null,
  originalTransactionId: string | null,
  expiresAt: Timestamp | null,
  autoRenew: boolean,
  verifiedAt: Timestamp,
  verifiedServerSide: boolean   // set only by Cloud Function, never by client
}
```

## /admins/{uid}
```ts
{ role: "admin" | "editor", grantedAt: Timestamp, grantedBy: string }
```
Existence of this doc is what the security rules check for admin privileges — never a client-supplied field.

---

## Indexes needed (Firestore composite indexes)
- `exerciseLogs`: `date ASC, timestamp ASC` (for weekly chart range queries)
- `exerciseLogs`: `exerciseId ASC, weightKg DESC` (for PR lookups / exercise history)
- `exercises`: `primaryMuscle ASC, name ASC` (library filtering)
- `workoutSessions`: `status ASC, startedAt DESC` (resume in-progress + history list)

## Why this shape
- Flat `exerciseLogs` (rather than nested inside sessions) makes every chart in section 12 (weight, volume, strength, frequency, PR, muscle distribution) a single indexed query instead of reading every session document.
- `subscriptions.verifiedServerSide` is never writable by the client — only a Cloud Function (after receipt validation with Apple/Google) can set it, which is what makes "no fake subscription status" actually enforceable.
- `exercises` stays public/global and separate from `customExercises` so the 500-exercise seed library can be updated by admins without touching any user data, and user-created exercises never leak into the public library.
