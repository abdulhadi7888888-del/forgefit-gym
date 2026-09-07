import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported as analyticsSupported } from 'firebase/analytics'
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  signOut as fbSignOut
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  // Firebase web config is safe to expose in the client; keep the API key in
  // Vite env when available and support the project defaults as a fallback.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.apiKey || 'AIzaSyForgeFitPublicWebConfig',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'forgefit-gym.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'forgefit-gym',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'forgefit-gym.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '604418018647',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:604418018647:web:5ac4bdf4c495fd44e18212',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-KNN2XBZZFX'
}

const missing = Object.entries(firebaseConfig)
  .filter(([k, v]) => k !== 'measurementId' && !v)
  .map(([k]) => k)
export const firebaseConfigMissing = missing.length > 0

if (firebaseConfigMissing) {
  console.error(`Firebase config is missing: ${missing.join(', ')}. Add the VITE_FIREBASE_* variables in the deployment settings.`)
}

// Keep the app renderable when deployment variables are absent. Auth is disabled
// below so users see a clear configuration message instead of a blank page.
const safeConfig = firebaseConfigMissing ? {
  apiKey: 'missing-firebase-config',
  authDomain: 'missing-firebase-config.firebaseapp.com',
  projectId: 'missing-firebase-config',
  storageBucket: 'missing-firebase-config.appspot.com',
  messagingSenderId: 'missing',
  appId: 'missing'
} : firebaseConfig

export const app = initializeApp(safeConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Analytics only works in a real browser with cookies/storage available
// (not in this build/preview sandbox), so it's initialized defensively.
export let analytics = null
analyticsSupported().then(supported => {
  if (supported && firebaseConfig.measurementId) {
    analytics = getAnalytics(app)
  }
})

const googleProvider = new GoogleAuthProvider()
const appleProvider = new OAuthProvider('apple.com')

export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password).then(async (cred) => {
    await sendEmailVerification(cred.user)
    return cred.user
  })
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password).then((c) => c.user)
}

// Popup avoids Safari/iOS in-app-browser issues where signInWithRedirect
// silently fails (third-party storage blocked, so getRedirectResult never
// finds the pending sign-in and the user just lands back on the login page).
// If the popup itself is blocked by the browser, fall back to redirect.
export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider).catch((err) => {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
      return signInWithRedirect(auth, googleProvider)
    }
    throw err
  })
}

export function signInWithApple() {
  return signInWithPopup(auth, appleProvider).catch((err) => {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
      return signInWithRedirect(auth, appleProvider)
    }
    throw err
  })
}

// After a redirect-based sign-in (Google/Apple), the browser navigates away
// and comes back — call this once when a page mounts to pick up the result
// (a signed-in user) or surface any error (e.g. provider not enabled).
export function getAuthRedirectResult() {
  return getRedirectResult(auth).then((cred) => cred?.user || null)
}

export function signInAsGuest() {
  return signInAnonymously(auth).then((c) => c.user)
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}

export function signOut() {
  return fbSignOut(auth)
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback)
}
