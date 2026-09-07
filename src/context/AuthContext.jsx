import { createContext, useContext, useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, watchAuthState } from '../lib/firebase'
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
    const unsub = watchAuthState(async (u) => {
      setUser(u)
      if (u) {
        track('app_opened')
        const userRef = doc(db, 'users', u.uid)
        const snap = await getDoc(userRef)
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: u.uid,
            email: u.email || null,
            emailLower: u.email ? u.email.toLowerCase() : null,
            displayName: u.displayName || null,
            authProvider: u.isAnonymous ? 'guest' : (u.providerData[0]?.providerId || 'password'),
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            role: 'user',
            isPremium: false,
            units: 'kg',
            theme: 'dark'
          })
        } else {
          await setDoc(userRef, {
            lastLoginAt: serverTimestamp(),
            ...(u.email ? { emailLower: u.email.toLowerCase() } : {})
          }, { merge: true })
        }

        if (u.email && u.email.toLowerCase() === OWNER_EMAIL) {
          try {
            await setDoc(doc(db, 'admins', u.uid), {
              role: 'admin',
              grantedAt: serverTimestamp(),
              grantedBy: 'auto-owner-email'
            }, { merge: true })
          } catch (err) {
            // If firestore.rules hasn't been updated yet, this silently no-ops
            // instead of blocking sign-in.
            console.warn('Auto admin grant failed (check firestore.rules)', err)
          }
        }

        const profileRef = doc(db, 'profiles', u.uid)
        const profileSnap = await getDoc(profileRef)
        setProfile(profileSnap.exists() ? profileSnap.data() : null)
      } else {
        setProfile(null)
      }
      setLoading(false)
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
