import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { exercises } from '../data/exercises'
import { useAuth } from '../context/AuthContext'
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getFavorites, toggleFavorite } from '../lib/customData'
import ExerciseMedia from '../components/ExerciseMedia'

const TABS = ['Overview', 'Instructions', 'Tips', 'History']

export default function ExerciseDetail() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const staticExercise = exercises.find(e => e.slug === slug)
  const [liveExercise, setLiveExercise] = useState(null)
  const [history, setHistory] = useState([])
  const [pr, setPr] = useState(null)
  const [favId, setFavId] = useState(null)
  const [tab, setTab] = useState('Overview')

  useEffect(() => {
    async function load() {
      const exSnap = await getDoc(doc(db, 'exercises', slug))
      setLiveExercise(exSnap.exists() ? exSnap.data() : null)

      const q = query(
        collection(db, 'exerciseLogs', user.uid, 'logs'),
        where('exerciseId', '==', slug),
        orderBy('timestamp', 'desc')
      )
      const snap = await getDocs(q)
      setHistory(snap.docs.slice(0, 10).map(d => d.data()))

      const prSnap = await getDoc(doc(db, 'personalRecords', user.uid, 'records', slug))
      setPr(prSnap.exists() ? prSnap.data() : null)

      const favs = await getFavorites(user.uid)
      const existing = favs.find(f => f.type === 'exercise' && f.refId === slug)
      setFavId(existing ? existing.id : null)
    }
    if (user) load()
  }, [user, slug])

  async function handleFavorite() {
    const newId = await toggleFavorite(user.uid, 'exercise', slug, !!favId, favId)
    setFavId(newId)
  }

  // Keep the local exercise definition as the baseline so every exercise
  // retains its default start/end demonstration even when Firebase only
  // overrides text, sets, or other fields.
  if (!staticExercise && !liveExercise) return <div className="app"><main><p>Exercise not found.</p></main></div>
  const exercise = { ...(staticExercise || {}), ...(liveExercise || {}) }
  exercise.imageUrl = liveExercise?.imageUrl || staticExercise?.imageUrl || null
  exercise.imageUrlStart = liveExercise?.imageUrlStart || staticExercise?.imageUrlStart || null
  exercise.imageUrlEnd = liveExercise?.imageUrlEnd || staticExercise?.imageUrlEnd || null

  // Instructions can arrive either as a `steps` array (custom/admin-authored
  // exercises) or an `instructions` array (older shape) — normalize to one list.
  const instructionSteps = (exercise.steps?.length ? exercise.steps : exercise.instructions?.length ? exercise.instructions : [])
  const tips = [...(exercise.safetyTips || []), ...(exercise.mistakes || []).map(m => `Avoid: ${m}`)]

  return (
    <div className="app">
      <header>
        <button className="secondary" onClick={() => nav(-1)}>← Back</button>
        <button className="secondary" onClick={handleFavorite}>{favId ? 'Saved' : 'Save'}</button>
      </header>
      <main>
        <h1>{exercise.name}</h1>

        <ExerciseMedia
          imageUrl={exercise.imageUrl}
          imageUrlStart={exercise.imageUrlStart}
          imageUrlEnd={exercise.imageUrlEnd}
          videoUrl={exercise.videoUrl}
          alt={exercise.name}
          exerciseId={slug}
        />

        <div className="chips">
          {TABS.map(t => (
            <button key={t} className={`chip ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t.toUpperCase()}</button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div className="card">
            <div className="row"><span className="muted">Main muscle</span><span>{exercise.primaryMuscle}</span></div>
            {exercise.secondaryMuscles?.length > 0 && (
              <div className="row" style={{ marginTop: 8 }}><span className="muted">Secondary muscles</span><span>{exercise.secondaryMuscles.join(', ')}</span></div>
            )}
            <div className="row" style={{ marginTop: 8 }}><span className="muted">Equipment</span><span>{exercise.equipment}</span></div>
            <div className="row" style={{ marginTop: 8 }}><span className="muted">Difficulty</span><span>{exercise.difficulty}</span></div>
            <div className="row" style={{ marginTop: 8 }}><span className="muted">Suggested</span><span>{exercise.defaultSets} sets × {exercise.repRange}</span></div>
            <div className="row" style={{ marginTop: 8 }}><span className="muted">Rest</span><span>{exercise.restSeconds}s</span></div>
            {pr && (
              <div className="row" style={{ marginTop: 8 }}>
                <span className="muted">Personal record</span>
                <span>{pr.bestWeightKg} kg × {pr.bestReps} • Est. 1RM {pr.estimated1RM.toFixed(1)} kg</span>
              </div>
            )}
          </div>
        )}

        {tab === 'Instructions' && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>How to perform</h3>
            {instructionSteps.length > 0
              ? <ol style={{ paddingLeft: 20, marginBottom: 0 }}>{instructionSteps.map((step, i) => <li key={i} style={{ marginBottom: 8 }}>{step}</li>)}</ol>
              : <p className="muted">No step-by-step instructions added for this exercise yet.</p>}
          </div>
        )}

        {tab === 'Tips' && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Tips & common mistakes</h3>
            {tips.length > 0
              ? <ul style={{ paddingLeft: 20, marginBottom: 0 }}>{tips.map((tip, i) => <li key={i} style={{ marginBottom: 8 }}>{tip}</li>)}</ul>
              : <p className="muted">No tips added for this exercise yet.</p>}
          </div>
        )}

        {tab === 'History' && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Recent history</h3>
            {history.length === 0 && <p className="muted">No sets logged yet — this fills in once you train it.</p>}
            {history.map((h, i) => (
              <div key={i} className="row" style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                <span className="muted">{h.date}</span>
                <span>{h.weightKg} kg × {h.reps}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
