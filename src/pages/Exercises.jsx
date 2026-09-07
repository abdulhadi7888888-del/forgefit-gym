import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { exercises, muscleGroups } from '../data/exercises'
import { track } from '../lib/analytics'
import TabBar from '../components/TabBar'
import ExerciseThumb from '../components/ExerciseThumb'

const muscleMeta = {
  Chest: 'Push strength and upper-body power', Back: 'Pull strength and posture', Shoulders: 'Pressing power and stability',
  Biceps: 'Arm strength and control', Triceps: 'Lockout strength and definition', Legs: 'Lower-body strength and drive',
  Glutes: 'Hip power and athletic output', Abs: 'Core control and bracing', Cardio: 'Conditioning and engine work', Mobility: 'Move better, recover faster'
}

export default function Exercises() {
  const [q, setQ] = useState('')
  const [muscle, setMuscle] = useState('All')
  const [equipment, setEquipment] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const fullCatalog = exercises
  const nav = useNavigate()
  const equipmentOptions = useMemo(() => [...new Set(fullCatalog.map(x => x.equipment))].sort(), [fullCatalog])
  const filtered = useMemo(() => fullCatalog.filter(e => {
    const term = q.trim().toLowerCase()
    return (!term || `${e.name} ${e.primaryMuscle} ${e.equipment}`.toLowerCase().includes(term)) &&
      (muscle === 'All' || e.primaryMuscle === muscle) && (equipment === 'All' || e.equipment === equipment) &&
      (difficulty === 'All' || e.difficulty === difficulty)
  }), [fullCatalog, q, muscle, equipment, difficulty])

  function handleSearch(value) { setQ(value); if (value.length > 2) track('exercise_searched', { query: value }) }
  const featured = fullCatalog.filter(e => ['beginner', 'intermediate'].includes(e.difficulty)).slice(0, 3)

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">TRAINING LIBRARY</div>
        <div className="row" style={{ alignItems: 'end', marginBottom: 8 }}><div><h1 style={{ marginBottom: 6 }}>Find your next move.</h1><p className="muted" style={{ margin: 0 }}>{fullCatalog.length}+ movements, coached for every level.</p></div><span className="stat-pill">{filtered.length} FOUND</span></div>
        <div className="library-search"><span aria-hidden="true">⌕</span><input aria-label="Search exercises" placeholder="Search movement, muscle or equipment" value={q} onChange={e => handleSearch(e.target.value)} /><button className="secondary" onClick={() => setShowFilters(v => !v)} aria-expanded={showFilters}>FILTERS</button></div>
        {showFilters && <div className="card filter-panel"><select value={equipment} onChange={e => setEquipment(e.target.value)}><option>All equipment</option>{equipmentOptions.map(x => <option key={x} value={x}>{x}</option>)}</select><select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option value="All">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>}
        <div className="chips library-chips">{['All', ...muscleGroups].map(m => <button key={m} className={`chip ${muscle === m ? 'active' : ''}`} onClick={() => setMuscle(m)}>{m}</button>)}</div>
        {!q && muscle === 'All' && equipment === 'All' && difficulty === 'All' && <section><div className="section-heading"><h2>Start here</h2><span className="muted">Coach picks</span></div><div className="featured-grid">{featured.map(e => <button className="featured-exercise" key={e.slug} onClick={() => nav(`/exercises/${e.slug}`)}><ExerciseThumb exercise={e} size={80} /><span><strong>{e.name}</strong><small>{e.primaryMuscle} · {e.difficulty}</small></span><b>↗</b></button>)}</div></section>}
        <div className="section-heading" style={{ marginTop: 24 }}><h2>{muscle === 'All' ? 'All movements' : muscle}</h2><span className="muted">{muscleMeta[muscle] || 'Built for your program'}</span></div>
        <div className="exercise-list">{filtered.length === 0 && <div className="card empty-state"><strong>No movement matches that search.</strong><p className="muted">Try a different muscle, equipment type, or difficulty.</p></div>}{filtered.map(e => <button key={e.slug} className="exercise exercise-row" onClick={() => { track('exercise_viewed', { exercise: e.slug }); nav(`/exercises/${e.slug}`) }}><ExerciseThumb exercise={e} /><span className="exercise-copy"><strong>{e.name}</strong><small>{e.primaryMuscle} <i>·</i> {e.equipment}</small></span><span className={`difficulty difficulty-${e.difficulty}`}>{e.difficulty}</span><b aria-hidden="true">›</b></button>)}</div>
        <div className="row" style={{ margin: '20px 0 88px' }}><Link to="/custom-exercise" className="secondary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>+ CUSTOM EXERCISE</Link><Link to="/history" className="secondary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>HISTORY</Link></div>
      </main><TabBar active="exercises" />
    </div>
  )
}
