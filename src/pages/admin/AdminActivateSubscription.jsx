import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../../lib/firebase'
import { adminFindUserByEmail } from '../../lib/adminData'

const PLANS = [
  { label: 'Monthly — Rs 8,000', months: 1, amount: 8000 },
  { label: '6-Month — Rs 30,000 (Rs 5,000/mo)', months: 6, amount: 30000 },
  { label: '12-Month — Rs 48,000 (Rs 4,000/mo)', months: 12, amount: 48000 }
]

export default function AdminActivateSubscription() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') || '')
  const [uid, setUid] = useState('')
  const [plan, setPlan] = useState(PLANS[1])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [matches, setMatches] = useState([])
  const [searched, setSearched] = useState(false)

  async function findUser() {
    if (!email.trim()) return
    setStatus('')
    setSearched(false)
    // Exact-match server-side query on emailLower — one small read instead
    // of downloading hundreds of user docs to filter client-side.
    const found = await adminFindUserByEmail(email)
    setMatches(found)
    setSearched(true)
    if (found.length === 1) setUid(found[0].id)
  }

  async function activate() {
    if (!uid) { setStatus('Select a user first.'); return }
    setBusy(true)
    setStatus('')
    try {
      const fn = httpsCallable(getFunctions(app), 'adminActivateSubscription')
      const res = await fn({ targetUid: uid, months: plan.months, amountPaid: plan.amount })
      setStatus(`Activated. Expires ${new Date(res.data.expiresAt).toLocaleDateString()}.`)
    } catch (err) {
      setStatus(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM <span className="muted" style={{ fontSize: 12 }}>ADMIN</span></div></header>
      <main>
        <div className="eyebrow">ADMIN</div>
        <h1>Activate subscription</h1>
        <p className="muted">Use this after verifying a WhatsApp payment slip / bank transfer, or to grant plan access to a Gmail account directly.</p>

        <div className="card">
          <div className="field"><label>User email (Gmail, etc.)</label>
            <div className="row">
              <input className="search" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@gmail.com" onKeyDown={e => e.key === 'Enter' && findUser()} />
              <button className="secondary" onClick={findUser}>FIND</button>
            </div>
          </div>

          {searched && matches.length === 0 && (
            <p className="muted">No account found with that exact email. Check spelling — this is an exact match, not a partial search.</p>
          )}

          {matches.length > 0 && (
            <div className="field">
              <label>Matches</label>
              {matches.map(u => (
                <div key={u.id} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <span>{u.email || u.displayName}</span>
                  <button className="secondary" onClick={() => setUid(u.id)}>{uid === u.id ? 'Selected ✓' : 'Select'}</button>
                </div>
              ))}
            </div>
          )}

          <div className="field"><label>Plan</label>
            <select className="search" value={plan.months} onChange={e => setPlan(PLANS.find(p => p.months === Number(e.target.value)))}>
              {PLANS.map(p => <option key={p.months} value={p.months}>{p.label}</option>)}
            </select>
          </div>

          <button className="primary" disabled={busy || !uid} onClick={activate}>
            {busy ? 'Activating…' : `ACTIVATE ${plan.months}-MONTH PLAN`}
          </button>
          {status && <p className="muted">{status}</p>}
        </div>

        <p className="muted">
          This sets a real expiry date. A scheduled Cloud Function (`checkExpiredSubscriptions`)
          automatically locks the account back to free the day it expires — no manual step needed then.
        </p>
      </main>
    </div>
  )
}
