import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { logCardio, getCardioHistory } from '../lib/customData'
import { isHealthSyncAvailable, currentHealthPlatform, requestHealthPermissions, syncHealthWorkouts } from '../lib/healthSync'

const TYPES = ['Running', 'Walking', 'Cycling', 'Treadmill', 'Elliptical', 'Rowing', 'Stair Climber', 'Swimming']

export default function Cardio() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [form, setForm] = useState({ type: TYPES[0], durationMin: '', distanceKm: '', caloriesEstimate: '' })
  const [syncState, setSyncState] = useState('idle') // idle | syncing | done | error

  const healthAvailable = isHealthSyncAvailable()
  const platformLabel = currentHealthPlatform() === 'ios' ? 'Apple Health' : currentHealthPlatform() === 'android' ? 'Google Health Connect' : null

  useEffect(() => { refresh() }, [user])

  async function refresh() {
    setHistory(await getCardioHistory(user.uid))
  }

  async function save() {
    if (!form.durationMin) return
    await logCardio(user.uid, {
      type: form.type,
      durationMin: Number(form.durationMin),
      distanceKm: Number(form.distanceKm) || null,
      caloriesEstimate: Number(form.caloriesEstimate) || null
    })
    setForm({ type: TYPES[0], durationMin: '', distanceKm: '', caloriesEstimate: '' })
    refresh()
  }

  async function syncFromHealthApp() {
    setSyncState('syncing')
    const perm = await requestHealthPermissions()
    if (!perm.granted) { setSyncState('error'); return }

    const existingSourceIds = new Set(history.filter(h => h.sourceId).map(h => h.sourceId))
    const result = await syncHealthWorkouts(user.uid, { existingSourceIds })
    setSyncState(result.error ? 'error' : 'done')
    if (result.synced > 0) refresh()
  }

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">CARDIO</div>
        <h1>Log cardio</h1>

        {healthAvailable && (
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span>Sync workouts from {platformLabel}</span>
            <button className="secondary" onClick={syncFromHealthApp} disabled={syncState === 'syncing'}>
              {syncState === 'syncing' ? 'Syncing…' : syncState === 'done' ? 'Synced ✓' : 'Sync now'}
            </button>
          </div>
        )}
        {syncState === 'error' && <p className="muted">Couldn't sync from {platformLabel} — check that permission was granted in Settings.</p>}

        <div className="card">
          <div className="field"><label>Type</label>
            <select className="search" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select></div>
          <div className="row">
            <input className="search" style={{ width: '32%' }} type="number" placeholder="Minutes"
              value={form.durationMin} onChange={e => setForm(f => ({ ...f, durationMin: e.target.value }))} />
            <input className="search" style={{ width: '32%' }} type="number" placeholder="Distance km"
              value={form.distanceKm} onChange={e => setForm(f => ({ ...f, distanceKm: e.target.value }))} />
            <input className="search" style={{ width: '32%' }} type="number" placeholder="Calories"
              value={form.caloriesEstimate} onChange={e => setForm(f => ({ ...f, caloriesEstimate: e.target.value }))} />
          </div>
          <button className="primary" onClick={save}>LOG CARDIO</button>
        </div>

        <h3>Recent sessions</h3>
        {history.length === 0 && <p className="muted">No cardio logged yet.</p>}
        {history.map(h => (
          <div key={h.id} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <span>{h.type} • {h.durationMin} min{h.source ? ` • ${h.source === 'ios' ? 'Apple Health' : 'Health Connect'}` : ''}</span>
            <span className="muted">{h.date}</span>
          </div>
        ))}
      </main>
    </div>
  )
}
