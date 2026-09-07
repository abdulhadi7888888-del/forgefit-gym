import { useEffect, useState } from 'react'
import { adminGetAllExercises, adminSaveExercise, adminDeleteExercise } from '../../lib/adminData'
import { muscleGroups, equipmentTypes } from '../../data/exercises'
import ExerciseThumb from '../../components/ExerciseThumb'

const EMPTY = {
  name: '', primaryMuscle: muscleGroups[0], equipment: equipmentTypes[0],
  difficulty: 'beginner', defaultSets: 3, repRange: '8-12', restSeconds: 60,
  instructions: '', imageUrl: '', imageUrlStart: '', imageUrlEnd: '', videoUrl: ''
}

export default function AdminExercises() {
  const [list, setList] = useState([])
  const [editing, setEditing] = useState(null) // exercise being edited, or EMPTY for new
  const [q, setQ] = useState('')

  useEffect(() => { refresh() }, [])

  async function refresh() {
    setList(await adminGetAllExercises())
  }

  async function save() {
    if (!editing.name) return
    await adminSaveExercise(editing)
    setEditing(null)
    refresh()
  }

  async function remove(slug) {
    if (!confirm('Delete this exercise from the public library?')) return
    await adminDeleteExercise(slug)
    refresh()
  }

  const filtered = list.filter(e => e.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM <span className="muted" style={{ fontSize: 12 }}>ADMIN</span></div></header>
      <main>
        <div className="eyebrow">ADMIN</div>
        <h1>Exercise library</h1>

        {!editing
          ? <button className="primary" onClick={() => setEditing(EMPTY)}>+ NEW EXERCISE</button>
          : (
            <div className="card">
              <h3 style={{ marginTop: 0 }}>{editing.slug ? 'Edit' : 'New'} exercise</h3>
              <div className="field"><label>Name</label>
                <input className="search" value={editing.name} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))} /></div>
              <div className="row">
                <div className="field" style={{ flex: 1 }}><label>Muscle</label>
                  <select className="search" value={editing.primaryMuscle} onChange={e => setEditing(v => ({ ...v, primaryMuscle: e.target.value }))}>
                    {muscleGroups.map(m => <option key={m} value={m}>{m}</option>)}
                  </select></div>
                <div className="field" style={{ flex: 1 }}><label>Equipment</label>
                  <select className="search" value={editing.equipment} onChange={e => setEditing(v => ({ ...v, equipment: e.target.value }))}>
                    {equipmentTypes.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                  </select></div>
              </div>
              <div className="field"><label>Instructions</label>
                <input className="search" value={editing.instructions} onChange={e => setEditing(v => ({ ...v, instructions: e.target.value }))} /></div>
              <div className="row">
                <input className="search" style={{ width: '30%' }} type="number" value={editing.defaultSets}
                  onChange={e => setEditing(v => ({ ...v, defaultSets: Number(e.target.value) }))} placeholder="Sets" />
                <input className="search" style={{ width: '35%' }} value={editing.repRange}
                  onChange={e => setEditing(v => ({ ...v, repRange: e.target.value }))} placeholder="Rep range" />
                <input className="search" style={{ width: '30%' }} type="number" value={editing.restSeconds}
                  onChange={e => setEditing(v => ({ ...v, restSeconds: Number(e.target.value) }))} placeholder="Rest (s)" />
              </div>
              <div className="row">
                <div className="field" style={{ flex: 1 }}><label>Step 1 image — start position</label>
                  <input className="search" value={editing.imageUrlStart} onChange={e => setEditing(v => ({ ...v, imageUrlStart: e.target.value }))} placeholder="https://…" /></div>
                <div className="field" style={{ flex: 1 }}><label>Step 2 image — end position</label>
                  <input className="search" value={editing.imageUrlEnd} onChange={e => setEditing(v => ({ ...v, imageUrlEnd: e.target.value }))} placeholder="https://…" /></div>
              </div>
              {(editing.imageUrlStart || editing.imageUrlEnd) && (
                <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                  {editing.imageUrlStart && <img src={editing.imageUrlStart} alt="start preview" style={{ width: '50%', borderRadius: 10 }} />}
                  {editing.imageUrlEnd && <img src={editing.imageUrlEnd} alt="end preview" style={{ width: '50%', borderRadius: 10 }} />}
                </div>
              )}
              <div className="field"><label>Video URL (your own hosted/licensed media)</label>
                <input className="search" value={editing.videoUrl} onChange={e => setEditing(v => ({ ...v, videoUrl: e.target.value }))} /></div>
              <div className="row" style={{ marginTop: 10 }}>
                <button className="secondary" onClick={() => setEditing(null)}>CANCEL</button>
                <button className="primary" onClick={save}>SAVE</button>
              </div>
            </div>
          )}

        <input className="search" style={{ margin: '14px 0' }} placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />

        <div className="card">
          {filtered.map(e => (
            <div key={e.slug} className="exercise">
              <ExerciseThumb exercise={e} />
              <div style={{ flex: 1 }}><h3>{e.name}</h3><p>{e.primaryMuscle} • {e.equipment}</p></div>
              <button className="secondary" onClick={() => setEditing(e)}>Edit</button>
              <button className="secondary" onClick={() => remove(e.slug)}>Delete</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
