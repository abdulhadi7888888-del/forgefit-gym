import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { exercises, muscleGroups } from '../data/exercises'
import { track } from '../lib/analytics'
import TabBar from '../components/TabBar'

export default function Exercises() {
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState('All')
  const [equipment, setEquipment] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const nav = useNavigate()

  const filtered = exercises.filter(e => {
    const matchesQ = (e.name + e.primaryMuscle + e.equipment).toLowerCase().includes(q.toLowerCase())
    const matchesMuscle = muscle === 'All' || e.primaryMuscle === muscle
    const matchesEquipment = equipment === 'All' || e.equipment === equipment
    const matchesDifficulty = difficulty === 'All' || e.difficulty === difficulty
    return matchesQ && matchesMuscle && matchesEquipment && matchesDifficulty
  })

  function handleSearch(value) {
    setQ(value)
    if (value.length > 2) track('exercise_searched', { query: value })
  }

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">LIBRARY</div>
        <h1>{exercises.length}+ exercises</h1>
        <input className="search" placeholder="Search exercise, muscle or equipment…"
          value={q} onChange={e => handleSearch(e.target.value)} />
        <div className="chips" style={{ margin: '12px 0' }}>
          {['All', ...muscleGroups].map(m => (
            <button key={m} className={`chip ${muscle === m ? 'active' : ''}`} onClick={() => setMuscle(m)}>{m}</button>
          ))}
        </div>
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <select value={equipment} onChange={e => setEquipment(e.target.value)} style={{ flex: 1 }}><option>All</option>{[...new Set(exercises.map(x => x.equipment))].sort().map(x => <option key={x}>{x}</option>)}</select>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ flex: 1 }}><option>All</option><option>beginner</option><option>intermediate</option><option>advanced</option></select>
        </div>
        <p className="muted" style={{ marginTop: 0 }}>{filtered.length} exercises found • Search by name, muscle or equipment</p>
        <div className="row" style={{ margin: '10px 0' }}>
          <Link to="/custom-exercise" className="secondary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', width: '48%' }}>+ CUSTOM EXERCISE</Link>
          <Link to="/history" className="secondary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', width: '48%' }}>WORKOUT HISTORY</Link>
        </div>
        <div className="card">
          {filtered.length === 0 && <p className="muted">No exercises found.</p>}
          {filtered.map(e => (
            <div key={e.slug} className="exercise" onClick={() => { track('exercise_viewed', { exercise: e.slug }); nav(`/exercises/${e.slug}`) }}>
              <div className="thumb">💪</div>
              <div style={{ flex: 1 }}>
                <h3>{e.name}</h3>
                <p>{e.primaryMuscle} • {e.equipment}</p>
              </div>
              <span>›</span>
            </div>
          ))}
        </div>
      </main>
      <TabBar active="exercises" />
    </div>
  )
}
