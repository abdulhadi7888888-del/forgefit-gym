import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { exercises as libraryExercises } from '../data/exercises'
import {
  createCustomPlan, getAllPlans, updatePlan, deletePlan, setActivePlan, duplicatePlan
} from '../lib/customData'
import { getCustomExercises } from '../lib/customData'
import { Link } from 'react-router-dom'
import TabBar from '../components/TabBar'

const TEMPLATES = ['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body', 'Full Body', 'Chest Day', 'Back Day', 'Arm Day']

export default function WorkoutBuilder() {
  const { user } = useAuth()
  const [plans, setPlans] = useState([])
  const [customExercises, setCustomExercises] = useState([])
  const [building, setBuilding] = useState(false)
  const [name, setName] = useState('')
  const [dayExercises, setDayExercises] = useState([])
  const [picker, setPicker] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const allExercises = [...libraryExercises, ...customExercises]

  useEffect(() => { refresh() }, [user])

  async function refresh() {
    try {
      const [p, ce] = await Promise.all([getAllPlans(user.uid), getCustomExercises(user.uid)])
      setPlans(p); setCustomExercises(ce); setError('')
    } catch (err) { console.warn('Workout builder data unavailable:', err); setError('Your saved workouts could not be loaded. Check your connection.') }
  }

  function addExerciseToBuild() {
    const ex = allExercises.find(e => e.slug === picker)
    if (!ex) return
    setDayExercises(list => [...list, {
      exerciseId: ex.slug, name: ex.name, sets: ex.defaultSets || 3,
      repRange: ex.repRange || '8-12', restSeconds: ex.restSeconds || 60
    }])
    setPicker('')
  }

  function removeExercise(i) {
    setDayExercises(list => list.filter((_, idx) => idx !== i))
  }

  function moveExercise(i, dir) {
    setDayExercises(list => {
      const copy = [...list]
      const j = i + dir
      if (j < 0 || j >= copy.length) return copy
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })
  }

  function updateExerciseField(i, field, value) {
    setDayExercises(list => list.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }

  async function savePlan() {
    if (!name || dayExercises.length === 0 || saving) return
    setSaving(true); setError('')
    try {
    await createCustomPlan(user.uid, {
      name,
      daysPerWeek: 1,
      schedule: [{ day: 'custom', name, exerciseIds: dayExercises }]
    })
    setName(''); setDayExercises([]); setBuilding(false)
    await refresh()
    } catch (err) { setError('Could not save this workout. Check your connection.') } finally { setSaving(false) }
  }

  async function activate(planId) {
    await setActivePlan(user.uid, planId, plans.map(p => p.id))
    refresh()
  }

  async function remove(planId) {
    await deletePlan(user.uid, planId)
    refresh()
  }

  async function duplicate(plan) {
    await duplicatePlan(user.uid, plan)
    refresh()
  }

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">CUSTOM WORKOUTS</div>
        <h1>Build your own routine</h1>
        {error && <p className="error">{error}</p>}

        {!building
          ? (
            <>
              <button className="primary" onClick={() => setBuilding(true)}>+ NEW CUSTOM WORKOUT</button>
              <Link to="/workout-generator" className="secondary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 10 }}>SMART WORKOUT GENERATOR</Link>
            </>
          )
          : (
            <div className="card">
              <div className="field">
                <label>Workout name</label>
                <input className="search" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Push Day" />
              </div>
              <div className="chips">
                {TEMPLATES.map(t => (
                  <button key={t} className="chip" onClick={() => setName(t)}>{t}</button>
                ))}
              </div>

              <div className="field">
                <label>Add exercise</label>
                <div className="row">
                  <select className="search" value={picker} onChange={e => setPicker(e.target.value)}>
                    <option value="">Select exercise…</option>
                    {allExercises.map(e => <option key={e.slug} value={e.slug}>{e.name}</option>)}
                  </select>
                  <button className="secondary" onClick={addExerciseToBuild}>ADD</button>
                </div>
              </div>

              {dayExercises.map((e, i) => (
                <div key={i} className="card" style={{ margin: '8px 0', padding: 12 }}>
                  <div className="row">
                    <b>{e.name}</b>
                    <div>
                      <button className="secondary" aria-label="Move exercise up" onClick={() => moveExercise(i, -1)}>UP</button>{' '}
                      <button className="secondary" aria-label="Move exercise down" onClick={() => moveExercise(i, 1)}>DOWN</button>{' '}
                      <button className="secondary" aria-label="Remove exercise" onClick={() => removeExercise(i)}>REMOVE</button>
                    </div>
                  </div>
                  <div className="row" style={{ marginTop: 8 }}>
                    <input className="search" style={{ width: '30%' }} type="number" value={e.sets}
                      onChange={ev => updateExerciseField(i, 'sets', Number(ev.target.value))} placeholder="Sets" />
                    <input className="search" style={{ width: '35%' }} value={e.repRange}
                      onChange={ev => updateExerciseField(i, 'repRange', ev.target.value)} placeholder="Rep range" />
                    <input className="search" style={{ width: '30%' }} type="number" value={e.restSeconds}
                      onChange={ev => updateExerciseField(i, 'restSeconds', Number(ev.target.value))} placeholder="Rest (s)" />
                  </div>
                </div>
              ))}

              <div className="row" style={{ marginTop: 12 }}>
                <button className="secondary" onClick={() => { setBuilding(false); setDayExercises([]); setName('') }}>CANCEL</button>
                <button className="primary" onClick={savePlan} disabled={saving}>{saving ? 'SAVING…' : 'SAVE WORKOUT'}</button>
              </div>
            </div>
          )}

        <h3>Your workouts</h3>
        {plans.length === 0 && <p className="muted">No custom workouts yet.</p>}
        {plans.map(p => (
          <div key={p.id} className="card">
            <div className="row">
              <div>
                <h3 style={{ margin: 0 }}>{p.name}{p.isActive && <span className="muted"> • active</span>}</h3>
                <p className="muted">{p.schedule?.[0]?.exerciseIds?.length || 0} exercises</p>
              </div>
            </div>
            <div className="row" style={{ marginTop: 10, gap: 8 }}>
              {!p.isActive && <button className="secondary" onClick={() => activate(p.id)}>SET ACTIVE</button>}
              <button className="secondary" onClick={() => duplicate(p)}>DUPLICATE</button>
              <button className="secondary" onClick={() => remove(p.id)}>DELETE</button>
            </div>
          </div>
        ))}
      </main>
      <TabBar active="workout" />
    </div>
  )
}
