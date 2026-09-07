import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { addMeasurement, getMeasurementHistory } from '../lib/measurements'
import TabBar from '../components/TabBar'

const METRICS = [
  { key: 'chestCm', label: 'Chest', unit: 'cm' },
  { key: 'waistCm', label: 'Waist', unit: 'cm' },
  { key: 'armsCm', label: 'Arms', unit: 'cm' },
  { key: 'thighsCm', label: 'Thighs', unit: 'cm' },
  { key: 'shouldersCm', label: 'Shoulders', unit: 'cm' },
  { key: 'bodyFatPct', label: 'Body fat', unit: '%' }
]

export default function Measurements() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [history, setHistory] = useState([])
  const [form, setForm] = useState({ chestCm: '', waistCm: '', armsCm: '', thighsCm: '', shouldersCm: '', bodyFatPct: '' })
  const [chartMetric, setChartMetric] = useState('waistCm')
  const [saving, setSaving] = useState(false)

  useEffect(() => { refresh() }, [user])

  async function refresh() {
    setHistory(await getMeasurementHistory(user.uid))
  }

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function save() {
    const hasAny = METRICS.some(m => form[m.key] !== '')
    if (!hasAny) return
    setSaving(true)
    try {
      await addMeasurement(user.uid, {
        chestCm: Number(form.chestCm) || null,
        waistCm: Number(form.waistCm) || null,
        armsCm: Number(form.armsCm) || null,
        thighsCm: Number(form.thighsCm) || null,
        shouldersCm: Number(form.shouldersCm) || null,
        bodyFatPct: Number(form.bodyFatPct) || null
      })
      setForm({ chestCm: '', waistCm: '', armsCm: '', thighsCm: '', shouldersCm: '', bodyFatPct: '' })
      refresh()
    } finally {
      setSaving(false)
    }
  }

  const chartData = history.filter(h => h[chartMetric] != null)

  return (
    <div className="app">
      <header>
        <button className="secondary" onClick={() => nav(-1)}>← Back</button>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div>
      </header>
      <main>
        <div className="eyebrow">BODY MEASUREMENTS</div>
        <h1>Track your shape</h1>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add today's measurements</h3>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Chest (cm)</label>
              <input className="search" type="number" value={form.chestCm} onChange={e => update('chestCm', e.target.value)} /></div>
            <div className="field" style={{ flex: 1 }}><label>Waist (cm)</label>
              <input className="search" type="number" value={form.waistCm} onChange={e => update('waistCm', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Arms (cm)</label>
              <input className="search" type="number" value={form.armsCm} onChange={e => update('armsCm', e.target.value)} /></div>
            <div className="field" style={{ flex: 1 }}><label>Thighs (cm)</label>
              <input className="search" type="number" value={form.thighsCm} onChange={e => update('thighsCm', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Shoulders (cm)</label>
              <input className="search" type="number" value={form.shouldersCm} onChange={e => update('shouldersCm', e.target.value)} /></div>
            <div className="field" style={{ flex: 1 }}><label>Body fat (%)</label>
              <input className="search" type="number" value={form.bodyFatPct} onChange={e => update('bodyFatPct', e.target.value)} /></div>
          </div>
          <button className="primary" disabled={saving} onClick={save}>{saving ? 'SAVING…' : 'SAVE MEASUREMENTS'}</button>
        </div>

        <div className="card">
          <div className="row"><h3 style={{ margin: 0 }}>Progress chart</h3></div>
          <div className="chips">
            {METRICS.map(m => (
              <button key={m.key} className={`chip ${chartMetric === m.key ? 'active' : ''}`} onClick={() => setChartMetric(m.key)}>{m.label}</button>
            ))}
          </div>
          {chartData.length > 0
            ? <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" hide /><YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e3dfd6', borderRadius: 10 }} />
                  <Line type="monotone" dataKey={chartMetric} stroke="#ff4d23" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            : <p className="muted">Add an entry with this metric to start the chart.</p>}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Recent entries</h3>
          {history.length === 0 && <p className="muted">No measurements logged yet.</p>}
          {history.slice().reverse().slice(0, 10).map(h => (
            <div key={h.id} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <span className="muted">{h.date}</span>
              <span>
                {METRICS.filter(m => h[m.key] != null).map(m => `${m.label} ${h[m.key]}${m.unit}`).join(' · ') || '—'}
              </span>
            </div>
          ))}
        </div>
      </main>
      <TabBar active="progress" />
    </div>
  )
}
