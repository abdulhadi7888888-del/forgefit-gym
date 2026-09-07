import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getRecentSessions, getSessionSetLogs } from '../lib/data'
import WorkoutCalendar from '../components/WorkoutCalendar'

function formatDuration(totalSeconds) {
  if (!totalSeconds) return null
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function History() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [setLogsBySession, setSetLogsBySession] = useState({})

  async function toggleExpand(id) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!setLogsBySession[id]) {
      try {
        const logs = await getSessionSetLogs(user.uid, id)
        setSetLogsBySession(prev => ({ ...prev, [id]: logs }))
      } catch (err) {
        setSetLogsBySession(prev => ({ ...prev, [id]: [] }))
      }
    }
  }

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

  const sessionsByDate = sessions.reduce((acc, s) => {
    const d = s.startedAt?.toDate?.() || new Date()
    const key = d.toISOString().slice(0, 10)
    acc[key] = acc[key] || []
    acc[key].push(s)
    return acc
  }, {})

  const byMonth = sessions.reduce((acc, s) => {
    const d = s.startedAt?.toDate?.() || new Date()
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    acc[key] = acc[key] || []
    acc[key].push(s)
    return acc
  }, {})

  const visibleSessions = selectedDate ? (sessionsByDate[selectedDate] || []) : null

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">HISTORY</div>
        <h1>Workout history</h1>

        <WorkoutCalendar sessionsByDate={sessionsByDate} onSelectDay={setSelectedDate} selectedDate={selectedDate} />

        {selectedDate && (
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 10px' }}>
            <p className="muted" style={{ margin: 0 }}>Showing {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <button className="secondary" style={{ padding: '6px 12px' }} onClick={() => setSelectedDate(null)}>Show all</button>
          </div>
        )}

        {sessions.length === 0 && <p className="muted">Completed workouts will show up here.</p>}

        {visibleSessions
          ? visibleSessions.map(s => (
              <SessionCard key={s.id} s={s} expanded={expanded} onToggle={toggleExpand} setLogs={setLogsBySession[s.id]} />
            ))
          : Object.entries(byMonth).map(([month, list]) => (
              <div key={month}>
                <h3>{month}</h3>
                {list.map(s => (
                  <SessionCard key={s.id} s={s} expanded={expanded} onToggle={toggleExpand} setLogs={setLogsBySession[s.id]} />
                ))}
              </div>
            ))}
      </main>
    </div>
  )
}

function SessionCard({ s, expanded, onToggle, setLogs }) {
  const duration = formatDuration(s.durationSeconds)
  const notedSets = (setLogs || []).filter(l => l.note)
  return (
    <div className="card" onClick={() => onToggle(s.id)} style={{ cursor: 'pointer' }}>
      <div className="row">
        <div>
          <b>{s.dayName}</b>
          <p className="muted" style={{ margin: '4px 0 0' }}>
            {s.startedAt?.toDate?.().toLocaleDateString()} • {Math.round(s.totalVolume).toLocaleString()} kg • {s.totalSets} sets{duration ? ` • ${duration}` : ''}
          </p>
        </div>
        <span>{expanded === s.id ? '▲' : '▼'}</span>
      </div>
      {expanded === s.id && (
        <div style={{ marginTop: 10 }}>
          <p className="muted">Feeling: {s.feeling || 'not recorded'}</p>
          {s.notes && <p>{s.notes}</p>}
          {setLogs === undefined && <p className="muted">Loading set notes…</p>}
          {notedSets.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <p className="muted" style={{ margin: '0 0 4px' }}>Set notes</p>
              {notedSets.map(l => (
                <p key={l.id} style={{ margin: '2px 0', fontSize: 13 }}><b>{l.exerciseName}</b> · set {l.setNumber}: {l.note}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
