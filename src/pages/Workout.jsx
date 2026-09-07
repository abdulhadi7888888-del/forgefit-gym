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
  const [savingSet, setSavingSet] = useState(false)
  const timerRef = useRef(null)
  const currentExercise = day?.exerciseIds?.[exerciseIndex] || null

  useEffect(() => {
    if (!day) { nav('/'); return }
    let cancelled = false
    startSession(user.uid, day.name, state.planId)
      .then(id => { if (!cancelled) setSessionId(id) })
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
    setSets(Array.from({ length: count }, () => ({ w: '', r: '', done: false })))
  }

  function updateSet(i, field, value) {
    setSets(s => s.map((set, idx) => idx === i ? { ...set, [field]: value } : set))
  }

  async function completeSet(i) {
    const s = sets[i]
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
      reps: r
    })
      setSets(prev => prev.map((set, idx) => idx === i ? { ...set, done: true } : set))
      setRestSeconds(currentExercise.restSeconds || 60)
    } catch (err) {
      setSessionError('This set could not be saved. Check your connection and try again.')
    } finally {
      setSavingSet(false)
    }
  }

  function addSet() {
    setSets(s => [...s, { w: '', r: '', done: false }])
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
      await finishSession(user.uid, sessionId, feeling, notes)
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
        <h2>{currentExercise.name}</h2>
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
              <FragmentRow key={i} i={i} s={s} onW={v => updateSet(i, 'w', v)} onR={v => updateSet(i, 'r', v)} onComplete={() => completeSet(i)} />
            ))}
          </div>
          <button className="secondary" style={{ width: '100%', marginTop: 10 }} onClick={addSet}>+ ADD SET</button>
        </div>

        {exerciseIndex < day.exerciseIds.length - 1
          ? <button className="primary" onClick={nextExercise}>NEXT EXERCISE</button>
          : <button className="primary" onClick={() => setShowFinish(true)}>FINISH WORKOUT</button>}
      </main>
    </div>
  )
}

function FragmentRow({ i, s, onW, onR, onComplete }) {
  return (
    <>
      <span>{i + 1}</span>
      <input type="number" value={s.w} placeholder="e.g. 20" onChange={e => onW(e.target.value)} disabled={s.done} />
      <input type="number" value={s.r} placeholder="e.g. 8" onChange={e => onR(e.target.value)} disabled={s.done} />
      <button onClick={onComplete} disabled={s.done}>{s.done ? 'DONE' : 'LOG SET'}</button>
    </>
  )
}
