import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

export function useSubscriptionStatus() {
  const { user } = useAuth()
  const [status, setStatus] = useState('loading') // loading | active | expired | free
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), snap => {
      setIsAdmin(snap.exists() && snap.data().role === 'admin')
    })
    const unsubSub = onSnapshot(doc(db, 'subscriptions', user.uid), snap => {
      if (!snap.exists()) { setStatus('free'); return }
      const sub = snap.data()
      if (sub.tier !== 'premium') { setStatus('free'); return }
      const expiresAt = sub.expiresAt?.toDate?.()
      if (expiresAt && expiresAt < new Date()) { setStatus('expired'); return }
      setStatus('active')
    })
    return () => { unsubUser(); unsubSub() }
  }, [user])

  // Admin is always treated as active, regardless of what's in subscriptions —
  // this is the one bypass in the whole premium-check system, and it only
  // fires off the real /users/{uid}.role field (set by grantAdminOnSignup or
  // scripts/makeAdmin.js), never a client-side flag.
  return isAdmin ? 'active' : status
}

export default function PremiumGuard({ children }) {
  const status = useSubscriptionStatus()

  if (status === 'loading') return <div className="app"><main><p className="muted">Checking your plan…</p></main></div>

  if (status !== 'active') {
    return (
      <div className="app">
        <main>
          <div className="eyebrow">PREMIUM FEATURE</div>
          <h1>{status === 'expired' ? 'Your plan expired' : 'Premium required'}</h1>
          <p className="muted">
            {status === 'expired'
              ? 'This feature locks when your billing period ends. Renew to get access back instantly.'
              : "This feature is part of a paid plan. Your 30-day free trial doesn't include it."}
          </p>
          <a href="/subscription" className="primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            {status === 'expired' ? 'RENEW NOW' : 'SEE PLANS'}
          </a>
        </main>
      </div>
    )
  }

  return children
}
