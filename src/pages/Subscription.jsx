import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'
import { track } from '../lib/analytics'
import { isUserAdmin } from '../lib/adminData'

const PLANS = [
  { id: 'monthly', label: 'Monthly', months: 1, price: 8000, total: 8000, note: 'Billed every month, no commitment' },
  { id: '6month', label: '6-Month', months: 6, price: 5000, total: 30000, note: 'Regular Rs 8,000/mo — you save Rs 18,000 (37.5% off)', badge: 'SAVE 37.5%' },
  { id: '12month', label: '12-Month', months: 12, price: 4000, total: 48000, note: 'Regular Rs 8,000/mo — you save Rs 48,000 (50% off)', badge: 'BEST VALUE' }
]

export default function Subscription() {
  const { user } = useAuth()
  const [sub, setSub] = useState(null)
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'subscriptions', user.uid), snap => {
      setSub(snap.exists() ? snap.data() : { tier: 'free' })
    })
    isUserAdmin(user.uid).then(setAdmin)
    return unsub
  }, [user])

  const isPremium = sub?.tier === 'premium'
  const expiresAt = sub?.expiresAt?.toDate?.()
  const isExpired = isPremium && expiresAt && expiresAt < new Date()

  function payVia(plan) {
    track('subscription_started', { plan: plan.id, amount: plan.total })
    const message = `Hi, I want to subscribe to the ForgeFit Gym ${plan.label} Plan — Rs ${plan.total.toLocaleString()} for ${plan.months} month(s). My account email: ${user.email || 'guest'}. I will send my payment slip here.`
    window.open(`https://wa.me/923134586476?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (admin) {
    return (
      <div className="app">
        <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
        <main>
          <div className="eyebrow">SUBSCRIPTION</div>
          <h1>You're an Admin</h1>
          <div className="card today">
            <p>Every premium feature is free on this account, permanently — no plan, no expiry, no renewal needed.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">SUBSCRIPTION</div>
        <h1>{isPremium && !isExpired ? "You're Premium" : isExpired ? 'Plan expired' : 'Go Premium'}</h1>

        {isPremium && expiresAt && (
          <p className={isExpired ? 'error' : 'muted'}>
            {isExpired ? `Expired ${expiresAt.toLocaleDateString()} — renew below to restore access.` : `Active until ${expiresAt.toLocaleDateString()}`}
          </p>
        )}

        {(!isPremium || isExpired) && PLANS.map(plan => (
          <div key={plan.id} className="card" style={{ position: 'relative' }}>
            {plan.badge && (
              <span style={{ position: 'absolute', top: -10, right: 16, background: 'var(--accent)', color: '#fff', fontWeight: 900, fontSize: 11, padding: '4px 10px', borderRadius: 999 }}>
                {plan.badge}
              </span>
            )}
            <h3 style={{ marginTop: 0 }}>{plan.label}</h3>
            <div style={{ fontSize: 26, fontWeight: 900 }}>Rs {plan.price.toLocaleString()} <small className="muted" style={{ fontSize: 13 }}>/ month</small></div>
            <p className="muted" style={{ fontSize: 13, margin: '4px 0 12px' }}>
              Rs {plan.total.toLocaleString()} total{plan.months > 1 ? ` for ${plan.months} months` : ''} • {plan.note}
            </p>
            <button className="primary" onClick={() => payVia(plan)}>SUBSCRIBE — Rs {plan.total.toLocaleString()}</button>
          </div>
        ))}

        <div className="card">
          <p className="muted" style={{ fontSize: 13 }}>
            Pay via bank transfer / JazzCash / EasyPaisa, then send your slip on WhatsApp
            (<a href="https://wa.me/923134586476" target="_blank" rel="noopener">+92 313 4586476</a>)
            or email <a href="mailto:abdulhadi7888888@gmail.com">abdulhadi7888888@gmail.com</a>. Access is activated
            within 24 hours of verification.
          </p>
        </div>

        <p className="muted">
          Status here always reflects <code>subscriptions/{'{uid}'}.verifiedServerSide</code> — only an
          admin (after checking your slip) or the verifySubscription function can set it. When a plan's
          billing period ends, a scheduled Cloud Function locks premium features back to free automatically.
        </p>
      </main>
    </div>
  )
}
