import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { app, db } from './firebase'

// Requires a VAPID key from Firebase Console -> Project Settings -> Cloud Messaging
// -> Web Push certificates, and a service worker at /firebase-messaging-sw.js
// (see public/firebase-messaging-sw.js).
export async function registerForPushNotifications(uid) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return { ok: false, reason: 'unsupported' }
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: 'denied' }

  try {
    const messaging = getMessaging(app)
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration
    })
    if (!token) return { ok: false, reason: 'no-token' }

    await setDoc(doc(db, 'users', uid), {
      fcmTokens: { [token]: true },
      lastTokenAt: serverTimestamp()
    }, { merge: true })

    onMessage(messaging, (payload) => {
      // Foreground notifications: show something in-app rather than relying
      // on the OS banner, which browsers suppress while the tab is focused.
      console.log('Foreground push received', payload)
    })

    return { ok: true, token }
  } catch (err) {
    console.error('Push registration failed', err)
    return { ok: false, reason: 'error', error: err }
  }
}
