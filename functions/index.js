import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { defineSecret } from 'firebase-functions/params'
import { google } from 'googleapis'

initializeApp()
const db = getFirestore()
const messaging = getMessaging()

// Secrets used by receipt verification (set with `firebase functions:secrets:set <NAME>`):
// - APPLE_SHARED_SECRET: App-specific shared secret from App Store Connect
//   (Users and Access > Integrations > In-App Purchase, or per-app "App-Specific Shared Secret").
// - GOOGLE_PLAY_SERVICE_ACCOUNT: full JSON key (as a single string) for a service
//   account granted "Financial data, orders, and cancellation survey responses" access
//   in Play Console > Setup > API access.
// - ANDROID_PACKAGE_NAME: e.g. com.forgefit.app
const appleSharedSecret = defineSecret('APPLE_SHARED_SECRET')
const googlePlayServiceAccount = defineSecret('GOOGLE_PLAY_SERVICE_ACCOUNT')
const androidPackageName = defineSecret('ANDROID_PACKAGE_NAME')

export { askCoach } from './aiCoach.js'

// Any account signing up with one of these emails is automatically made an
// admin the moment their /users/{uid} doc is created — no manual script
// needed. Add more emails here if other people need admin access.
const ADMIN_EMAILS = ['abdulhadi7888888@gmail.com']

/**
 * Fires once per new account (src/context/AuthContext.jsx creates this doc
 * on first sign-in). If the email matches ADMIN_EMAILS, grants:
 * - a real /admins/{uid} doc (what AdminGuard and the admin-only rules check)
 * - premium status with no expiry, so every premium feature is free for them
 */
export const grantAdminOnSignup = onDocumentCreated('users/{uid}', async (event) => {
  const { uid } = event.params
  const user = event.data.data()
  if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return

  await db.doc(`admins/${uid}`).set({
    role: 'admin',
    grantedAt: FieldValue.serverTimestamp(),
    grantedBy: 'auto-signup'
  })
  await db.doc(`users/${uid}`).set({ role: 'admin', isPremium: true }, { merge: true })
  await db.doc(`subscriptions/${uid}`).set({
    tier: 'premium',
    platform: 'admin',
    expiresAt: null, // never expires
    autoRenew: false,
    verifiedAt: FieldValue.serverTimestamp(),
    verifiedServerSide: true
  })
})


/**
 * Sends a real push notification to every FCM token stored on the user's doc
 * (src/lib/push.js writes tokens there after Notification.requestPermission).
 * Prunes tokens that have gone stale (uninstalled app, revoked permission)
 * so the token list doesn't grow unbounded with dead entries.
 */
async function sendPush(uid, { title, body }) {
  const userSnap = await db.doc(`users/${uid}`).get()
  const tokens = Object.keys(userSnap.data()?.fcmTokens || {})
  if (tokens.length === 0) return

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body }
  })

  const deadTokens = []
  response.responses.forEach((res, i) => {
    if (!res.success && ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(res.error?.code)) {
      deadTokens.push(tokens[i])
    }
  })
  if (deadTokens.length) {
    const update = {}
    deadTokens.forEach(t => { update[`fcmTokens.${t}`] = FieldValue.delete() })
    await db.doc(`users/${uid}`).update(update)
  }
}


/**
 * Callable from the client after an App Store / Play Store purchase completes.
 * The client sends the raw receipt/token — it NEVER sets tier or verifiedServerSide
 * itself (see firestore.rules: subscriptions writes are fully client-blocked).
 *
 * This function verifies the receipt with Apple/Google, then writes the result.
 * Fill in APPLE_SHARED_SECRET / Google Play service account before going live —
 * without them this throws instead of silently trusting the client.
 */
export const verifySubscription = onCall(
  { secrets: [appleSharedSecret, googlePlayServiceAccount, androidPackageName] },
  async (request) => {
    const uid = request.auth?.uid
    if (!uid) throw new HttpsError('unauthenticated', 'Sign in required.')

    const { platform, receipt, purchaseToken, productId } = request.data
    if (!platform || (!receipt && !purchaseToken)) {
      throw new HttpsError('invalid-argument', 'Missing receipt/purchaseToken.')
    }

    let result
    if (platform === 'ios') {
      result = await verifyAppleReceipt(receipt)
    } else if (platform === 'android') {
      if (!productId) throw new HttpsError('invalid-argument', 'Missing productId.')
      result = await verifyGooglePurchase(purchaseToken, productId)
    } else {
      throw new HttpsError('invalid-argument', 'Unknown platform.')
    }

    if (!result.valid) {
      throw new HttpsError('permission-denied', 'Receipt could not be verified.')
    }

    await db.doc(`subscriptions/${uid}`).set({
      tier: 'premium',
      platform,
      originalTransactionId: result.transactionId,
      expiresAt: result.expiresAt,
      autoRenew: result.autoRenew,
      verifiedAt: FieldValue.serverTimestamp(),
      verifiedServerSide: true
    })

    await db.doc(`users/${uid}`).set({ isPremium: true }, { merge: true })

    return { success: true, expiresAt: result.expiresAt }
  }
)

/**
 * Verifies an App Store receipt against Apple's verifyReceipt endpoint.
 * Tries production first; a 21007 status means it's a sandbox receipt, so
 * we retry against the sandbox host (this is Apple's documented flow —
 * lets the same code work for TestFlight/dev and real purchases).
 */
async function verifyAppleReceipt(receipt) {
  const secret = appleSharedSecret.value()
  if (!secret) throw new HttpsError('failed-precondition', 'Apple shared secret not configured.')

  const body = {
    'receipt-data': receipt,
    password: secret,
    'exclude-old-transactions': true
  }

  const callApple = async (url) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return res.json()
  }

  let data = await callApple('https://buy.itunes.apple.com/verifyReceipt')
  if (data.status === 21007) {
    data = await callApple('https://sandbox.itunes.apple.com/verifyReceipt')
  }

  if (data.status !== 0) {
    return { valid: false, status: data.status }
  }

  // latest_receipt_info holds the most recent renewal; fall back to the
  // top-level receipt for a one-time/non-renewing purchase.
  const latest = (data.latest_receipt_info || []).sort(
    (a, b) => Number(b.expires_date_ms || 0) - Number(a.expires_date_ms || 0)
  )[0] || data.receipt?.in_app?.[0]

  if (!latest) return { valid: false, status: 'no_transactions' }

  const expiresAtMs = Number(latest.expires_date_ms)
  const pendingRenewal = (data.pending_renewal_info || []).find(
    (r) => r.original_transaction_id === latest.original_transaction_id
  )

  return {
    valid: !expiresAtMs || expiresAtMs > Date.now(),
    transactionId: latest.original_transaction_id,
    expiresAt: expiresAtMs ? new Date(expiresAtMs) : null,
    autoRenew: pendingRenewal ? pendingRenewal.auto_renew_status === '1' : true
  }
}

/**
 * Verifies a Google Play purchase token via the Android Publisher API,
 * authenticated as a service account with access to the Play Console app.
 */
async function verifyGooglePurchase(purchaseToken, productId) {
  const rawKey = googlePlayServiceAccount.value()
  const packageName = androidPackageName.value()
  if (!rawKey || !packageName) {
    throw new HttpsError('failed-precondition', 'Google Play service account not configured.')
  }

  const credentials = JSON.parse(rawKey)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
  })
  const androidpublisher = google.androidpublisher({ version: 'v3', auth })

  const { data } = await androidpublisher.purchases.subscriptions.get({
    packageName,
    subscriptionId: productId,
    token: purchaseToken
  })

  // paymentState: 1 = received, 2 = free trial. cancelReason absent = active.
  const expiresAtMs = Number(data.expiryTimeMillis)
  const isActive = expiresAtMs > Date.now() && data.paymentState !== 0

  return {
    valid: isActive,
    transactionId: data.orderId,
    expiresAt: expiresAtMs ? new Date(expiresAtMs) : null,
    autoRenew: !!data.autoRenewing
  }
}

/**
 * Admin-only. Called from the admin panel after manually verifying a
 * WhatsApp payment slip. Sets real premium status with a real expiry date —
 * this is the ONLY way subscriptions get activated for manual (non-App
 * Store/Play) payments, and it still goes through the same subscriptions
 * doc + verifiedServerSide flag as the in-app-purchase path.
 */
export const adminActivateSubscription = onCall(async (request) => {
  const callerUid = request.auth?.uid
  if (!callerUid) throw new HttpsError('unauthenticated', 'Sign in required.')

  const adminSnap = await db.doc(`admins/${callerUid}`).get()
  if (!adminSnap.exists) throw new HttpsError('permission-denied', 'Admin only.')

  const { targetUid, months, amountPaid } = request.data
  if (!targetUid || !months) throw new HttpsError('invalid-argument', 'targetUid and months are required.')

  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + Number(months))

  await db.doc(`subscriptions/${targetUid}`).set({
    tier: 'premium',
    platform: 'manual',
    originalTransactionId: null,
    expiresAt,
    autoRenew: false,
    amountPaid: amountPaid || null,
    activatedByAdmin: callerUid,
    verifiedAt: FieldValue.serverTimestamp(),
    verifiedServerSide: true
  })

  await db.doc(`users/${targetUid}`).set({ isPremium: true }, { merge: true })

  await db.collection(`notifications/${targetUid}/items`).add({
    type: 'weekly_summary',
    title: 'Premium activated 🎉',
    body: `Your plan is active until ${expiresAt.toLocaleDateString()}.`,
    read: false,
    createdAt: FieldValue.serverTimestamp()
  })

  return { success: true, expiresAt: expiresAt.toISOString() }
})

/**
 * Runs daily. Any subscription whose expiresAt has passed gets locked:
 * tier flips back to "free" and isPremium clears, so PremiumGuard on the
 * client denies access immediately on next load — no manual step needed.
 * A renew reminder notification is sent once, right when it locks.
 */
export const checkExpiredSubscriptions = onSchedule('every day 06:00', async () => {
  const now = new Date()
  const snap = await db.collection('subscriptions').where('tier', '==', 'premium').get()

  for (const subDoc of snap.docs) {
    const sub = subDoc.data()
    if (!sub.expiresAt) continue // no expiry set (e.g. admin accounts) — never auto-locks
    const expiresAt = sub.expiresAt?.toDate ? sub.expiresAt.toDate() : new Date(sub.expiresAt)
    if (!expiresAt || expiresAt > now) continue

    const uid = subDoc.id
    await subDoc.ref.set({ tier: 'free', autoRenew: false }, { merge: true })
    await db.doc(`users/${uid}`).set({ isPremium: false }, { merge: true })
    await db.collection(`notifications/${uid}/items`).add({
      type: 'goal_reminder',
      title: 'Your plan has expired',
      body: 'Renew now on the pricing page to get your premium features back.',
      read: false,
      createdAt: FieldValue.serverTimestamp()
    })
  }
})

/**
 * Fires whenever a set is logged that raised a PR (see src/lib/data.js maybeSetPR,
 * which writes/updates personalRecords). Creates a notification doc the client
 * already has read rules for.
 */
export const onPersonalRecord = onDocumentCreated(
  'personalRecords/{uid}/records/{exerciseId}',
  async (event) => {
    const { uid } = event.params
    const data = event.data.data()
    const prefsSnap = await db.doc(`notificationPrefs/${uid}`).get()
    if (prefsSnap.exists && prefsSnap.data().prAchieved === false) return

    await db.collection(`notifications/${uid}/items`).add({
      type: 'pr',
      title: 'New Personal Record 🔥',
      body: `${data.exerciseName}: ${data.bestWeightKg}kg × ${data.bestReps}`,
      read: false,
      createdAt: FieldValue.serverTimestamp()
    })
    await sendPush(uid, {
      title: 'New Personal Record 🔥',
      body: `${data.exerciseName}: ${data.bestWeightKg}kg × ${data.bestReps}`
    })
  }
)

/**
 * Runs daily; writes a "missed workout" notification for anyone whose
 * active plan says today is a training day but who hasn't logged a session.
 * Scheduling logic mirrors src/lib/planGenerator.js todaysWorkout().
 */
export const missedWorkoutCheck = onSchedule('every day 20:00', async () => {
  const usersSnap = await db.collection('users').get()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const todayName = dayNames[new Date().getDay()]
  const todayKey = new Date().toISOString().slice(0, 10)

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id
    const prefsSnap = await db.doc(`notificationPrefs/${uid}`).get()
    if (prefsSnap.exists && prefsSnap.data().missedWorkout === false) continue

    const plansSnap = await db.collection(`workoutPlans/${uid}/plans`).where('isActive', '==', true).get()
    if (plansSnap.empty) continue
    const plan = plansSnap.docs[0].data()
    const scheduledToday = plan.schedule?.some(d => d.day === todayName)
    if (!scheduledToday) continue

    const sessionsSnap = await db.collection(`workoutSessions/${uid}/sessions`)
      .where('status', '==', 'completed').get()
    const loggedToday = sessionsSnap.docs.some(d => {
      const started = d.data().startedAt?.toDate?.()
      return started && started.toISOString().slice(0, 10) === todayKey
    })
    if (loggedToday) continue

    await db.collection(`notifications/${uid}/items`).add({
      type: 'missed_workout',
      title: "You haven't trained today",
      body: "Today's session is still on your plan — even a short one keeps the streak alive.",
      read: false,
      createdAt: FieldValue.serverTimestamp()
    })
    await sendPush(uid, {
      title: "You haven't trained today",
      body: "Today's session is still on your plan — even a short one keeps the streak alive."
    })
  }
})
