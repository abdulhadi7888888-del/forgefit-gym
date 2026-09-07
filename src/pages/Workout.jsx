import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { startSession, logSet, finishSession, getRecentExerciseLogs } from '../lib/data'
import { track } from '../lib/analytics'
import ExerciseMedia from '../components/ExerciseMedia'

const FEELINGS = [
  { id: 'bad', label: 'Bad' }, { id: 'normal', label: 'Normal' },
  { id: 'good', label: 'Good' }, { id: 'excellent', label: 'Excellent' }
]

export default function Workout() {
  const { state } = useLocation()
  const { user } = useAuth()
  const nav = useNavigate()
  const day = state?.day
  const [sessionId, setSessionId] = useState(null)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [sets, setSets] = useState([])
  const [restSeconds, setRestSeconds] = useState(0)
  const [showFinish, setShowFinish] = useState(false)
  const [feeling, setFeeling] = useState(null)
  const [notes, setNotes] = useState('')
  const [sessionError, setSessionError] = useState('')
  const [previousLogs, setPreviousLogs] = useState([])
  const [sessionReady, setSessionReady] = useState(false)
  const [savingSet, setSavingSet] = useState(false)
  const timerRef = useRef(null)
  const startedAtRef = useRef(Date.now())
  const currentExercise = day?.exerciseIds?.[exerciseIndex] || null

  useEffect(() => {
    if (!day) { nav('/'); return }
    let cancelled = false
    startSession(user.uid, day.name, state.planId)
      .then(id => { if (!cancelled) { setSessionId(id); setSessionReady(true) } })
      .catch(err => { if (!cancelled) setSessionError('Workout session could not be saved yet. You can continue entering sets, then retry the save.') })
    track('workout_started', { workout_name: day.name, exercise_count: day.exerciseIds.length })
    resetSetsForExercise(0)
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!currentExercise?.exerciseId) return undefined
    getRecentExerciseLogs(user.uid, currentExercise.exerciseId, 20)
      .then(rows => { if (!cancelled) setPreviousLogs(rows) })
      .catch(() => { if (!cancelled) setPreviousLogs([]) })
    return () => { cancelled = true }
  }, [currentExercise?.exerciseId, user.uid])

  useEffect(() => {
    if (restSeconds <= 0) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => setRestSeconds(s => s - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [restSeconds])

  if (!day) return null

  function resetSetsForExercise(idx) {
    const count = day.exerciseIds[idx].sets
    setSets(Array.from({ length: count }, () => ({ w: '', r: '', note: '', done: false })))
  }

  function updateSet(i, field, value) {
    setSets(s => s.map((set, idx) => idx === i ? { ...set, [field]: value } : set))
  }

  // overrides lets quickLogAll supply values for a row without waiting on a
  // state update to land first (state updates are async, this call isn't).
  async function completeSet(i, overrides) {
    const s = overrides || sets[i]
    const w = Number(s.w), r = Number(s.r)
    if (!w || !r || savingSet) return
    if (!sessionId) { setSessionError('Preparing your workout session. Please wait a moment before logging the set.'); return }
    setSavingSet(true)
    setSessionError('')
    try {
      await logSet(user.uid, sessionId, {
      exerciseId: currentExercise.exerciseId,
      exerciseName: currentExercise.name,
      setNumber: i + 1,
      weightKg: w,
      reps: r,
      note: s.note || ''
    })
      setSets(prev => prev.map((set, idx) => idx === i ? { ...set, w: String(s.w), r: String(s.r), done: true } : set))
      setRestSeconds(currentExercise.restSeconds || 60)
    } catch (err) {
      setSessionError('This set could not be saved. Check your connection and try again.')
    } finally {
      setSavingSet(false)
    }
  }

  function addSet() {
    setSets(s => [...s, { w: '', r: '', note: '', done: false }])
  }

  // Logs every remaining set in one tap. Any row left blank is filled from
  // the last completed set in this exercise, falling back to what was lifted
  // last time — same "log all sets in one click" shortcut as the reference
  // app, so a straight-sets exercise doesn't need a tap per row.
  async function quickLogAll() {
    if (savingSet) return
    const lastDone = [...sets].reverse().find(s => s.done)
    const fallback = lastDone
      ? { w: lastDone.w, r: lastDone.r }
      : previousLogs[0]
        ? { w: String(previousLogs[0].weightKg), r: String(previousLogs[0].reps) }
        : null

    const toLog = sets
      .map((s, idx) => ({ idx, values: { w: s.w || fallback?.w || '', r: s.r || fallback?.r || '', note: s.note } }))
      .filter(({ idx, values }) => !sets[idx].done && values.w && values.r)

    if (toLog.length === 0) {
      setSessionError('Enter a weight and reps for at least one set (or log one set normally first) before using Quick Log All.')
      return
    }

    setSets(prev => prev.map((set, idx) => {
      const match = toLog.find(t => t.idx === idx)
      return match ? { ...set, w: match.values.w, r: match.values.r } : set
    }))

    for (const { idx, values } of toLog) {
      await completeSet(idx, values)
    }
  }

  function nextExercise() {
    if (exerciseIndex < day.exerciseIds.length - 1) {
      const next = exerciseIndex + 1
      setExerciseIndex(next)
      resetSetsForExercise(next)
      setRestSeconds(0)
    }
  }

  async function finish() {
    if (!sessionId) { setSessionError('Your workout session is still preparing. Please wait and try again.'); return }
    try {
      const durationSeconds = Math.round((Date.now() - startedAtRef.current) / 1000)
      await finishSession(user.uid, sessionId, feeling, notes, durationSeconds)
    track('workout_completed', { workout_name: day.name, feeling })
      nav('/')
    } catch (err) {
      setSessionError('The workout could not be finished. Check your connection and try again.')
    }
  }

  if (showFinish) {
    return (
      <div className="app">
        <header><div className="brand">{day.name}</div></header>
        <main>
          {sessionError && <p className="error" role="alert">{sessionError}</p>}
          <div className="eyebrow">HOW DID IT GO?</div>
          <h1>Finish workout</h1>
          <p className="muted" style={{ marginTop: -8 }}>Duration: {formatDuration(Math.round((Date.now() - startedAtRef.current) / 1000))}</p>
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-around', fontSize: 32 }}>
              {FEELINGS.map(f => (
                <button key={f.id} onClick={() => setFeeling(f.id)}
                  style={{ background: 'none', border: feeling === f.id ? '2px solid var(--accent)' : '2px solid transparent', borderRadius: 12, padding: 6 }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Notes (optional)</label>
              <input className="search" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Felt strong today…" />
            </div>
          </div>
          <button className="primary" onClick={finish} disabled={!sessionId}>SAVE & FINISH</button>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header>
        <div className="brand">{day.name}</div>
        <button className="secondary" onClick={() => nav('/')}>Cancel</button>
      </header>
      <main>
        {sessionError && <p className="error" role="alert">{sessionError}</p>}
        <div className="eyebrow">EXERCISE {exerciseIndex + 1} / {day.exerciseIds.length}</div>
        <div className="workout-heading"><div><h2>{currentExercise.name}</h2><p className="muted">{sessionReady ? 'Session ready — log your first set.' : 'Preparing your session…'}</p></div><span className={sessionReady ? 'ready-badge' : 'ready-badge is-loading'}>{sessionReady ? 'READY' : 'SYNCING'}</span></div>
        <p className="muted">Target: {currentExercise.repRange} reps • {currentExercise.sets} working sets • Rest {currentExercise.restSeconds}s</p>

        <ExerciseMedia
          exerciseId={currentExercise.exerciseId}
          alt={currentExercise.name}
          imageUrl={currentExercise.imageUrl}
          imageUrlStart={currentExercise.imageUrlStart}
          imageUrlEnd={currentExercise.imageUrlEnd}
          videoUrl={currentExercise.videoUrl}
        />
        {currentExercise.progressionNote && (
          <p className="muted progression-note" style={{ marginTop: -8 }}>{currentExercise.progressionNote}</p>
        )}

        {restSeconds > 0 && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="eyebrow">REST</div>
            <div style={{ fontSize: 48, fontWeight: 900 }}>{restSeconds}s</div>
            <button className="secondary" onClick={() => setRestSeconds(0)}>SKIP REST</button>
          </div>
        )}

        <div className="workout-target card">
          <div className="eyebrow">WORKING TARGET</div>
          <h3>{currentExercise.sets || 4} SETS × {currentExercise.repRange || '8-12'} REPS</h3>
          <p className="muted">Use a load you can control with about 1–2 good reps left. When every set reaches the top of the range with clean form, add a small amount next time.</p>
          <div className="target-grid">
            <div><span className="muted">WEIGHT (KG)</span><b>{previousLogs[0]?.weightKg ? `${previousLogs[0].weightKg} kg` : 'START LIGHT'}</b><small>{previousLogs[0] ? `Last: ${previousLogs[0].weightKg} kg × ${previousLogs[0].reps}` : 'Choose a controllable starting load'}</small></div>
            <div><span className="muted">REPS</span><b>{currentExercise.repRange || '8-12'}</b><small>Target per set</small></div>
            <div><span className="muted">REST</span><b>{currentExercise.restSeconds || 60}s</b><small>Between sets</small></div>
          </div>
        </div>

        <div className="card">
          <div className="sets">
            <b>SET</b><b>WEIGHT (KG)</b><b>REPS</b><b>DONE</b>
            {sets.map((s, i) => (
              <FragmentRow key={i} i={i} s={s}
                onW={v => updateSet(i, 'w', v)}
                onR={v => updateSet(i, 'r', v)}
                onNote={v => updateSet(i, 'note', v)}
                onComplete={() => completeSet(i)} />
            ))}
          </div>
          <div className="row" style={{ gap: 8, marginTop: 10 }}>
            <button className="secondary" style={{ flex: 1 }} onClick={addSet}>+ ADD SET</button>
            <button className="secondary" style={{ flex: 1 }} onClick={quickLogAll} disabled={savingSet}>
              {savingSet ? 'LOGGING…' : 'QUICK LOG ALL'}
            </button>
          </div>
        </div>

        {exerciseIndex < day.exerciseIds.length - 1
          ? <button className="primary" onClick={nextExercise}>NEXT EXERCISE</button>
          : <button className="primary" onClick={() => setShowFinish(true)}>FINISH WORKOUT</button>}
      </main>
    </div>
  )
}

function formatDuration(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function FragmentRow({ i, s, onW, onR, onNote, onComplete }) {
  return (
    <>
      <span>{i + 1}</span>
      <input type="number" value={s.w} placeholder="e.g. 20" onChange={e => onW(e.target.value)} disabled={s.done} />
      <input type="number" value={s.r} placeholder="e.g. 8" onChange={e => onR(e.target.value)} disabled={s.done} />
      <button onClick={onComplete} disabled={s.done}>{s.done ? 'DONE' : 'LOG SET'}</button>
      <input type="text" value={s.note} placeholder="Note for this set (optional)…"
        onChange={e => onNote(e.target.value)} disabled={s.done}
        style={{ gridColumn: '1 / -1', fontSize: 13, padding: '6px 9px', marginBottom: 2, opacity: s.done ? 0.6 : 1 }} />
    </>
  )
}
