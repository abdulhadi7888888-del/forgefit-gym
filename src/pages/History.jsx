import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getRecentSessions } from '../lib/data'

export default function History() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setSessions(await getRecentSessions(user.uid, 200))
      } catch (err) {
        console.error('History failed to load:', err)
      }
    }
    if (user) load()
  }, [user])

  const byMonth = sessions.reduce((acc, s) => {
    const d = s.startedAt?.toDate?.() || new Date()
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    acc[key] = acc[key] || []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">HISTORY</div>
        <h1>Workout history</h1>

        {sessions.length === 0 && <p className="muted">Completed workouts will show up here.</p>}

        {Object.entries(byMonth).map(([month, list]) => (
          <div key={month}>
            <h3>{month}</h3>
            {list.map(s => (
              <div key={s.id} className="card" onClick={() => setExpanded(expanded === s.id ? null : s.id)} style={{ cursor: 'pointer' }}>
                <div className="row">
                  <div>
                    <b>{s.dayName}</b>
                    <p className="muted" style={{ margin: '4px 0 0' }}>
                      {s.startedAt?.toDate?.().toLocaleDateString()} • {Math.round(s.totalVolume).toLocaleString()} kg • {s.totalSets} sets
                    </p>
                  </div>
                  <span>{expanded === s.id ? '▲' : '▼'}</span>
                </div>
                {expanded === s.id && (
                  <div style={{ marginTop: 10 }}>
                    <p className="muted">Feeling: {s.feeling || 'not recorded'}</p>
                    {s.notes && <p>{s.notes}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  )
}
