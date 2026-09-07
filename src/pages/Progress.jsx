import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBodyWeightHistory, addBodyWeight, getLogsSince, getAllPRs } from '../lib/data'
import TabBar from '../components/TabBar'

const RANGES = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }

export default function Progress() {
  const { user } = useAuth()
  const [range, setRange] = useState('30d')
  const [weights, setWeights] = useState([])
  const [logs, setLogs] = useState([])
  const [prs, setPrs] = useState([])
  const [weightInput, setWeightInput] = useState('')
  const [oneRMInputs, setOneRMInputs] = useState({ w: '', r: '' })

  const days = RANGES[range]
  const sinceDate = new Date(); sinceDate.setDate(sinceDate.getDate() - days)
  const sinceKey = sinceDate.toISOString().slice(0, 10)

  useEffect(() => {
    async function load() {
      try {
        const [w, l, p] = await Promise.all([
          getBodyWeightHistory(user.uid),
          getLogsSince(user.uid, sinceKey),
          getAllPRs(user.uid)
        ])
        setWeights(w)
        setLogs(l)
        setPrs(p.sort((a, b) => b.achievedAt?.toMillis() - a.achievedAt?.toMillis()))
      } catch (err) {
        console.error('Progress data failed to load:', err)
      }
    }
    if (user) load()
  }, [user, range])

  async function submitWeight() {
    const v = Number(weightInput)
    if (!v) return
    await addBodyWeight(user.uid, v)
    setWeightInput('')
    setWeights(await getBodyWeightHistory(user.uid))
  }

  // Body-weight history isn't range-scoped server-side (getBodyWeightHistory
  // returns everything), so apply the same 7d/30d/90d/1y window here that
  // getLogsSince already applies to the volume chart — otherwise switching
  // ranges only affected the volume chart while the weight chart always
  // showed full history.
  const weightsInRange = weights.filter(w => w.date >= sinceKey)

  const volumeByDate = Object.values(
    logs.reduce((acc, l) => {
      acc[l.date] = acc[l.date] || { date: l.date, volume: 0 }
      acc[l.date].volume += l.volume
      return acc
    }, {})
  )

  const oneRM = oneRMInputs.w && oneRMInputs.r
    ? {
        epley: (Number(oneRMInputs.w) * (1 + Number(oneRMInputs.r) / 30)).toFixed(1),
        brzycki: (Number(oneRMInputs.w) * 36 / (37 - Number(oneRMInputs.r))).toFixed(1)
      }
    : null

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">PROGRESS</div>
        <h1>Your performance</h1>

        <div className="chips">
          {Object.keys(RANGES).map(r => (
            <button key={r} className={`chip ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>

        <div className="row" style={{ gap: 8, margin: '10px 0' }}>
          <Link to="/cardio" className="secondary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>LOG CARDIO</Link>
          <Link to="/measurements" className="secondary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>BODY MEASUREMENTS</Link>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Body weight</h3>
          {weightsInRange.length > 0
            ? <ResponsiveContainer width="100%" height={140}>
                <LineChart data={weightsInRange}>
                  <XAxis dataKey="date" hide /><YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e3dfd6', borderRadius: 10 }} />
                  <Line type="monotone" dataKey="weightKg" stroke="#ff4d23" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            : <p className="muted">{weights.length > 0 ? 'No entries in this range.' : 'Add your first entry to start the chart.'}</p>}
          <div className="row" style={{ marginTop: 10 }}>
            <input className="search" style={{ width: '70%' }} type="number" placeholder="Weight kg"
              value={weightInput} onChange={e => setWeightInput(e.target.value)} />
            <button className="secondary" style={{ width: '26%' }} onClick={submitWeight}>ADD</button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Training volume</h3>
          {volumeByDate.length > 0
            ? <ResponsiveContainer width="100%" height={140}>
                <BarChart data={volumeByDate}>
                  <XAxis dataKey="date" hide /><YAxis hide />
                  <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e3dfd6', borderRadius: 10 }} />
                  <Bar dataKey="volume" fill="#ff4d23" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            : <p className="muted">Log sets to build your volume history.</p>}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>1RM calculator</h3>
          <div className="row">
            <input className="search" style={{ width: '48%' }} type="number" placeholder="Weight kg"
              value={oneRMInputs.w} onChange={e => setOneRMInputs(v => ({ ...v, w: e.target.value }))} />
            <input className="search" style={{ width: '48%' }} type="number" placeholder="Reps"
              value={oneRMInputs.r} onChange={e => setOneRMInputs(v => ({ ...v, r: e.target.value }))} />
          </div>
          {oneRM && <p style={{ marginTop: 10 }}>Epley: <b>{oneRM.epley} kg</b> • Brzycki: <b>{oneRM.brzycki} kg</b></p>}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Personal records</h3>
          {prs.length === 0 && <p className="muted">Your first PR shows up here automatically.</p>}
          {prs.map(pr => (
            <div key={pr.id} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <span>{pr.exerciseName}</span>
              <span className="muted">{pr.bestWeightKg} kg × {pr.bestReps}</span>
            </div>
          ))}
        </div>
      </main>
      <TabBar active="progress" />
    </div>
  )
}
