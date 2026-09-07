import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addCustomExercise, getCustomExercises, deleteCustomExercise } from '../lib/customData'
import { muscleGroups, equipmentTypes } from '../data/exercises'

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

export default function CustomExercise() {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [form, setForm] = useState({
    name: '', primaryMuscle: muscleGroups[0], equipment: equipmentTypes[0], difficulty: DIFFICULTIES[0],
    instructions: '', notes: '', imageUrl: '', videoUrl: '', defaultSets: 3, repRange: '8-12', restSeconds: 60
  })

  useEffect(() => { refresh() }, [user])

  async function refresh() {
    setList(await getCustomExercises(user.uid))
  }

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function save() {
    if (!form.name) return
    await addCustomExercise(user.uid, {
      ...form,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      secondaryMuscles: [],
      steps: [], mistakes: [], safetyTips: [],
      imageUrl: form.imageUrl || null, videoUrl: form.videoUrl || null
    })
    setForm({
      name: '', primaryMuscle: muscleGroups[0], equipment: equipmentTypes[0], difficulty: DIFFICULTIES[0],
      instructions: '', notes: '', imageUrl: '', videoUrl: '', defaultSets: 3, repRange: '8-12', restSeconds: 60
    })
    refresh()
  }

  async function remove(id) {
    await deleteCustomExercise(user.uid, id)
    refresh()
  }

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">MY EXERCISES</div>
        <h1>Create a custom exercise</h1>

        <div className="card">
          <div className="field"><label>Name</label>
            <input className="search" value={form.name} onChange={e => update('name', e.target.value)} /></div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label>Muscle</label>
              <select className="search" value={form.primaryMuscle} onChange={e => update('primaryMuscle', e.target.value)}>
                {muscleGroups.map(m => <option key={m} value={m}>{m}</option>)}
              </select></div>
            <div className="field" style={{ flex: 1 }}><label>Equipment</label>
              <select className="search" value={form.equipment} onChange={e => update('equipment', e.target.value)}>
                {equipmentTypes.map(e => <option key={e} value={e}>{e}</option>)}
              </select></div>
          </div>
          <div className="field"><label>Difficulty</label>
            <select className="search" value={form.difficulty} onChange={e => update('difficulty', e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select></div>
          <div className="field"><label>Instructions</label>
            <input className="search" value={form.instructions} onChange={e => update('instructions', e.target.value)} /></div>
          <div className="field"><label>Notes</label>
            <input className="search" value={form.notes} onChange={e => update('notes', e.target.value)} /></div>
          <div className="field"><label>Image URL (optional)</label>
            <input className="search" value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} /></div>
          <div className="field"><label>Video URL (optional)</label>
            <input className="search" value={form.videoUrl} onChange={e => update('videoUrl', e.target.value)} /></div>
          <div className="row">
            <input className="search" style={{ width: '30%' }} type="number" value={form.defaultSets}
              onChange={e => update('defaultSets', Number(e.target.value))} placeholder="Sets" />
            <input className="search" style={{ width: '35%' }} value={form.repRange}
              onChange={e => update('repRange', e.target.value)} placeholder="Rep range" />
            <input className="search" style={{ width: '30%' }} type="number" value={form.restSeconds}
              onChange={e => update('restSeconds', Number(e.target.value))} placeholder="Rest (s)" />
          </div>
          <button className="primary" onClick={save}>SAVE EXERCISE</button>
        </div>

        <h3>Your custom exercises</h3>
        {list.length === 0 && <p className="muted">None yet.</p>}
        {list.map(e => (
          <div key={e.id} className="exercise">
            <div className="thumb">💪</div>
            <div style={{ flex: 1 }}><h3>{e.name}</h3><p>{e.primaryMuscle} • {e.equipment}</p></div>
            <button className="secondary" onClick={() => remove(e.id)}>Delete</button>
          </div>
        ))}
      </main>
    </div>
  )
}
