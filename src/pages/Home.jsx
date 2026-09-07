import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getActivePlan, savePlan, getRecentSessions, getLogsSince } from '../lib/data'
import { updatePlan } from '../lib/customData'
import { generatePlan, todaysWorkout, getProgramDay, durationLabel } from '../lib/planGenerator'
import { exercises } from '../data/exercises'
import TabBar from '../components/TabBar'
import { findExerciseMedia } from '../lib/exerciseMedia'

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
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      // Never leave the dashboard stuck forever when Firestore/network is
      // unavailable. Firestore reads do not expose an AbortSignal, so a
      // timeout lets the UI recover while the SDK can continue its own retry.
      const withTimeout = (promise, ms = 10000) => Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Dashboard data is taking too long to load. Please check your internet connection and try again.')), ms)
        )
      ])

      try {
        let p = null

        try {
          p = await withTimeout(getActivePlan(user.uid))
          if (!p && profile) {
            // Generate the workout locally first so the dashboard can always
            // open. Save it when Firestore is reachable.
            const generated = generatePlan({
              daysPerWeek: profile.trainingFrequency || 3,
              equipment: profile.equipment || [],
              exerciseLibrary: exercises,
              fitnessLevel: profile.fitnessLevel || 'beginner',
              durationDays: profile.programDurationDays || 90
            })
            p = { id: null, ...generated }

            if (navigator.onLine) {
              try {
                const id = await withTimeout(savePlan(user.uid, generated), 8000)
                p.id = id
              } catch (saveErr) {
                console.warn('Could not save generated plan yet; using local plan.', saveErr)
              }
            }
          }
        } catch (planErr) {
          console.warn('Active plan could not be loaded; using a local workout plan.', planErr)
          if (profile) {
            const generated = generatePlan({
              daysPerWeek: profile.trainingFrequency || 3,
              equipment: profile.equipment || [],
              exerciseLibrary: exercises,
              fitnessLevel: profile.fitnessLevel || 'beginner',
              durationDays: profile.programDurationDays || 90
            })
            p = { id: null, ...generated }
          }
        }

        if (cancelled) return

        // Migrate older 5-day plans to the new Upper/Lower + Push/Pull/Legs
        // split. This prevents an already-saved plan from continuing to show
        // the old repeated Chest/Back/Legs rotation.
        if (p && profile?.trainingFrequency === 5 && p.splitVersion !== 3) {
          const upgraded = generatePlan({
            daysPerWeek: 5,
            equipment: profile.equipment || [],
            exerciseLibrary: exercises,
            fitnessLevel: profile.fitnessLevel || 'beginner',
            durationDays: profile.programDurationDays || p.totalDays || 90
          })
          if (p.id) {
            try {
              await updatePlan(user.uid, p.id, { ...upgraded, isActive: true })
              p = { id: p.id, ...upgraded }
            } catch (migrationErr) {
              console.warn('Could not save the new 5-day split yet; using it locally.', migrationErr)
              p = { id: p.id, ...upgraded }
            }
          } else {
            p = { id: null, ...upgraded }
          }
        }

        setPlan(p)
        setToday(todaysWorkout(p))
        // The dashboard shell and today's workout must render independently of
        // optional analytics/history queries. Never keep the whole app behind a
        // Firestore stats request.
        if (!cancelled) setLoading(false)

        Promise.allSettled([
          withTimeout(getLogsSince(user.uid, dateKeyDaysAgo(7)), 4000),
          withTimeout(getRecentSessions(user.uid, 5), 4000)
        ]).then(([logsResult, sessionsResult]) => {
          if (cancelled) return
          setLogs(logsResult.status === 'fulfilled' ? logsResult.value : [])
          setSessions(sessionsResult.status === 'fulfilled' ? sessionsResult.value : [])
        })
      } catch (err) {
        if (!cancelled) {
          console.error('Home dashboard failed to load:', err)
          setError(err?.message || 'Something went wrong while loading your dashboard.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    if (user && profile) load()
    return () => { cancelled = true }
  }, [user, profile, retryCount])

  useEffect(() => {
    let cancelled = false
    const first = today?.exerciseIds?.[0]
    if (!first) {
      setPreviewImage(null)
      return undefined
    }
    // Show the bundled start image immediately; upgrade to the real remote
    // catalog image when it is available. This keeps the home screen visual
    // even on slow/offline connections.
    const local = exercises.find(e => e.slug === first.exerciseId)?.imageUrlStart || null
    setPreviewImage(local)
    findExerciseMedia({ id: first.exerciseId, name: first.name }).then(media => {
      if (!cancelled && media) setPreviewImage(media.imageUrlStart || media.imageUrl || local)
    })
    return () => { cancelled = true }
  }, [today])

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
            <h2 style={{ margin: '7px 0 4px' }}>Nice work.</h2>
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
              <div className="today-status" aria-hidden="true">{canStartToday ? 'READY' : 'REST'}</div>
            </div>
            {canStartToday && previewImage && (
              <div className="home-exercise-preview">
                <img src={previewImage} alt={today.exerciseIds[0]?.name || 'Today exercise'} />
              </div>
            )}
            {canStartToday && (
              <button className="primary" onClick={() => nav('/workout', { state: { day: today, planId: plan.id } })}>
                START WORKOUT
              </button>
            )}
          </div>
        )}

        {profile?.trainingFrequency === 5 && isProgram && !programComplete && (
          <div className="card" style={{ marginTop: 14 }}>
            <div className="row">
              <div>
                <h3 style={{ margin: 0 }}>5-DAY TRAINING SPLIT</h3>
                <span className="muted">Upper / Lower / Push / Pull / Legs</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 7, marginTop: 14 }}>
              {['UPPER', 'LOWER', 'PUSH', 'PULL', 'LEGS'].map((label, i) => (
                <div key={label} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '10px 5px', textAlign: 'center', background: today?.name?.toUpperCase() === label ? 'var(--accent)' : 'var(--card)' }}>
                  <b style={{ fontSize: 11 }}>{i + 1}</b>
                  <div style={{ fontSize: 10, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
            <p className="muted" style={{ marginBottom: 0, fontSize: 13 }}>Monday-Friday are training days. Saturday and Sunday are recovery days. Exercises rotate so the same movement is not prescribed every training week.</p>
          </div>
        )}

        <div className="stats">
          <div className="stat"><span className="muted">Workouts</span><b>{workoutsThisWeek}</b><small className="muted">this week</small></div>
          <div className="stat"><span className="muted">Streak</span><b>{streak}</b><small className="muted">days</small></div>
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
