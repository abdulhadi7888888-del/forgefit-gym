import { createContext, useContext, useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, watchAuthState, firebaseConfigMissing } from '../lib/firebase'
import { track } from '../lib/analytics'

const AuthContext = createContext(null)

// Signing in with this exact Google account auto-grants admin access — no
// manual Firestore console step needed. Matching security rule lives in
// firestore.rules (admins/{uid} write is only allowed for this email, on
// their own uid document).
const OWNER_EMAIL = 'abdulhadi7888888@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (firebaseConfigMissing) {
      setLoading(false)
      return undefined
    }

    const unsub = watchAuthState(async (u) => {
      setUser(u)
      if (!u) {
        setProfile(null)
        setLoading(false)
        return
      }

      track('app_opened')
      // Authentication itself should never be held hostage by optional profile
      // bookkeeping. If Firestore is slow/offline, the user can still enter
      // the app and the dashboard has its own offline fallback.
      try {
        const timeout = (promise, ms = 5000) => Promise.race([
          promise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Profile request timed out')), ms))
        ])
        const userRef = doc(db, 'users', u.uid)
        try {
          const snap = await timeout(getDoc(userRef))
          if (!snap.exists()) {
            await timeout(setDoc(userRef, {
              uid: u.uid, email: u.email || null,
              emailLower: u.email ? u.email.toLowerCase() : null,
              displayName: u.displayName || null,
              authProvider: u.isAnonymous ? 'guest' : (u.providerData[0]?.providerId || 'password'),
              createdAt: serverTimestamp(), lastLoginAt: serverTimestamp(),
              role: 'user', isPremium: false, units: 'kg', theme: 'dark'
            }), 5000)
          } else {
            await timeout(setDoc(userRef, {
              lastLoginAt: serverTimestamp(),
              ...(u.email ? { emailLower: u.email.toLowerCase() } : {})
            }, { merge: true }), 5000)
          }
        } catch (err) {
          console.warn('User profile bookkeeping unavailable:', err)
        }

        if (u.email && u.email.toLowerCase() === OWNER_EMAIL) {
          try {
            await timeout(setDoc(doc(db, 'admins', u.uid), {
              role: 'admin', grantedAt: serverTimestamp(), grantedBy: 'auto-owner-email'
            }, { merge: true }), 4000)
          } catch (err) {
            console.warn('Auto admin grant unavailable:', err)
          }
        }

        try {
          const profileSnap = await timeout(getDoc(doc(db, 'profiles', u.uid)), 5000)
          setProfile(profileSnap.exists() ? profileSnap.data() : null)
        } catch (err) {
          console.warn('Profile unavailable; opening app without profile:', err)
          setProfile(null)
        }
      } finally {
        setLoading(false)
      }
    })
    return unsub
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
