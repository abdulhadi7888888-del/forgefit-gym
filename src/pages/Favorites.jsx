import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getFavorites } from '../lib/customData'
import { exercises } from '../data/exercises'
import TabBar from '../components/TabBar'
import ExerciseThumb from '../components/ExerciseThumb'

export default function Favorites() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [favs, setFavs] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const f = await getFavorites(user.uid)
        setFavs(f.filter(x => x.type === 'exercise'))
      } catch (err) {
        console.warn('Favorites unavailable:', err)
        setError('Favorites could not be loaded. Check your connection and try again.')
      }
    }
    if (user) load()
  }, [user])

  const favExercises = favs
    .map(f => exercises.find(e => e.slug === f.refId))
    .filter(Boolean)

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">FAVORITES</div>
        <h1>Saved exercises</h1>
        {error && <p className="error">{error}</p>}
        {favExercises.length === 0 && <p className="muted">Tap the star on any exercise to save it here.</p>}
        <div className="card">
          {favExercises.map(e => (
            <div key={e.slug} className="exercise" onClick={() => nav(`/exercises/${e.slug}`)}>
              <ExerciseThumb exercise={e} />
              <div style={{ flex: 1 }}><h3>{e.name}</h3><p>{e.primaryMuscle} • {e.equipment}</p></div>
              <span>›</span>
            </div>
          ))}
        </div>
      </main>
      <TabBar active="exercises" />
    </div>
  )
}
