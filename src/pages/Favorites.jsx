import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getFavorites } from '../lib/customData'
import { exercises } from '../data/exercises'
import TabBar from '../components/TabBar'

export default function Favorites() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [favs, setFavs] = useState([])

  useEffect(() => {
    async function load() {
      const f = await getFavorites(user.uid)
      setFavs(f.filter(x => x.type === 'exercise'))
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
        {favExercises.length === 0 && <p className="muted">Tap the star on any exercise to save it here.</p>}
        <div className="card">
          {favExercises.map(e => (
            <div key={e.slug} className="exercise" onClick={() => nav(`/exercises/${e.slug}`)}>
              <div className="thumb">💪</div>
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
