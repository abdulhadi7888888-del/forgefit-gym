import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getActivePlan, savePlan, getRecentSessions, getLogsSince } from '../lib/data'
import { updatePlan } from '../lib/customData'
import { generatePlan, todaysWorkout, getProgramDay, durationLabel } from '../lib/planGenerator'
import { exercises } from '../data/exercises'
import TabBar from '../components/TabBar'

function dateKeyDaysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export default function Home() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [plan, setPlan] = useState(null)
  const [today, setToday] = useState(null)
  const [logs, setLogs] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [startingNew, setStartingNew] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        let p = await getActivePlan(user.uid)
        if (!p && profile) {
          p = await createAndSaveProgram()
        }
        setPlan(p)
        setToday(todaysWorkout(p))

        const [logData, sessionData] = await Promise.all([
          getLogsSince(user.uid, dateKeyDaysAgo(7)),
          getRecentSessions(user.uid, 5)
        ])
        setLogs(logData)
        setSessions(sessionData)
      } catch (err) {
        console.error('Home dashboard failed to load:', err)
        setError(err?.message || 'Something went wrong while loading your dashboard.')
      } finally {
        setLoading(false)
      }
    }
    if (user && profile) load()
  }, [user, profile, retryCount])

  async function createAndSaveProgram() {
    const generated = generatePlan({
      daysPerWeek: profile.trainingFrequency || 3,
      equipment: profile.equipment || [],
      exerciseLibrary: exercises,
      fitnessLevel: profile.fitnessLevel || 'beginner',
      durationDays: profile.programDurationDays || 90
    })
    const id = await savePlan(user.uid, generated)
    return { id, ...generated }
  }

  async function startNewProgram() {
    if (startingNew) return
    setStartingNew(true)
    try {
      if (plan?.id) await updatePlan(user.uid, plan.id, { isActive: false })
      setRetryCount(c => c + 1)
    } catch (err) {
      console.error('Failed to start a new program:', err)
    } finally {
      setStartingNew(false)
    }
  }

  if (loading) return <div className="app"><main><p className="muted">Loading your dashboard…</p></main></div>

  if (error) {
    return (
      <div className="app">
        <main>
          <p className="error">{error}</p>
          <button className="primary" onClick={() => setRetryCount(c => c + 1)}>
            Try again
          </button>
        </main>
        <TabBar active="home" />
      </div>
    )
  }

  const weekStart = dateKeyDaysAgo(7)
  const totalVolume = logs.reduce((s, l) => s + l.volume, 0)
  const workoutsThisWeek = sessions.filter(s => s.startedAt?.toDate?.() >= new Date(weekStart)).length
  const streak = computeStreak(sessions)
  const chartDays = [6, 5, 4, 3, 2, 1, 0].map(dateKeyDaysAgo)
  const chartTotals = chartDays.map(d => logs.filter(l => l.date === d).reduce((s, l) => s + l.volume, 0))
  const chartMax = Math.max(...chartTotals, 1)

  const isProgram = plan?.schedule?.[0]?.dayNumber != null
  const totalDays = plan?.totalDays || 30
  const rawProgramDay = isProgram ? getProgramDay(plan) : null
  const programDay = isProgram ? Math.min(rawProgramDay, totalDays) : null
  const programComplete = isProgram && rawProgramDay > totalDays
  const isRestDay = !!today?.isRestDay
  const canStartToday = !!today && !isRestDay && today.exerciseIds?.length > 0

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">
          {isProgram && !programComplete
            ? `DAY ${programDay} OF ${totalDays} • CYCLE ${today?.cycle || 1} • WEEK ${today?.week || 1} • ${(today?.phase || '').toUpperCase()}`
            : new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
          {!isProgram && (today ? ` • ${today.name.toUpperCase()}` : ' • REST')}
        </div>
        <h1>Build your<br />strongest self.</h1>

        {programComplete ? (
          <div className="card today">
            <div className="eyebrow">{durationLabel(totalDays).toUpperCase()} PROGRAM COMPLETE</div>
            <h2 style={{ margin: '7px 0 4px' }}>Nice work. 🎉</h2>
            <div className="muted">Start a fresh {durationLabel(totalDays).toLowerCase()} program to keep training.</div>
            <button className="primary" disabled={startingNew} onClick={startNewProgram}>
              {startingNew ? 'STARTING…' : `START NEW ${durationLabel(totalDays).toUpperCase()} PROGRAM`}
            </button>
          </div>
        ) : (
          <div className="card today">
            <div className="row">
              <div>
                <div className="eyebrow">{isRestDay ? 'RECOVERY' : "TODAY'S WORKOUT"}</div>
                <h2 style={{ margin: '7px 0 4px' }}>{today ? today.name : 'Rest Day'}</h2>
                <div className="muted">
                  {canStartToday
                    ? `${today.exerciseIds.length} exercises • ~${today.exerciseIds.length * 12} min`
                    : 'Recovery — no session scheduled'}
                </div>
              </div>
              <div style={{ fontSize: 32 }}>{canStartToday ? '🏋️' : '😴'}</div>
            </div>
            {canStartToday && (
              <button className="primary" onClick={() => nav('/workout', { state: { day: today, planId: plan.id } })}>
                START WORKOUT
              </button>
            )}
          </div>
        )}

        <div className="stats">
          <div className="stat"><span className="muted">Workouts</span><b>{workoutsThisWeek}</b><small className="muted">this week</small></div>
          <div className="stat"><span className="muted">Streak</span><b>{streak} 🔥</b><small className="muted">days</small></div>
          <div className="stat"><span className="muted">Volume</span><b>{Math.round(totalVolume).toLocaleString()}</b><small className="muted">kg, 7 days</small></div>
          <div className="stat"><span className="muted">Workouts</span><b>{sessions.length}</b><small className="muted">completed total</small></div>
        </div>

        <div className="card">
          <div className="row"><h3 style={{ margin: 0 }}>Weekly volume</h3><span className="muted">7 days</span></div>
          <div style={{ height: 90, display: 'flex', alignItems: 'end', gap: 8, marginTop: 16 }}>
            {chartTotals.map((v, i) => (
              <i key={i} style={{ height: `${Math.max(6, Math.round(v / chartMax * 100))}%`, flex: 1, background: 'var(--accent)', borderRadius: 8 }} />
            ))}
          </div>
        </div>

        {sessions.length > 0 && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Recent workouts</h3>
            {sessions.slice(0, 3).map(s => (
              <div key={s.id} className="row" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span>{s.dayName}</span>
                <span className="muted">{Math.round(s.totalVolume).toLocaleString()} kg</span>
              </div>
            ))}
          </div>
        )}
      </main>
      <TabBar active="home" />
    </div>
  )
}

function computeStreak(sessions) {
  const days = new Set(sessions.map(s => s.startedAt?.toDate?.().toISOString().slice(0, 10)).filter(Boolean))
  let streak = 0, i = days.has(new Date().toISOString().slice(0, 10)) ? 0 : 1
  while (days.has(dateKeyDaysAgo(i))) { streak++; i++ }
  return streak
}
