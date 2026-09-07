import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { exercises as libraryExercises } from '../data/exercises'
import { generatePlan, DURATION_OPTIONS } from '../lib/planGenerator'
import { createCustomPlan } from '../lib/customData'
import TabBar from '../components/TabBar'

const GOALS = ['Build Muscle', 'Lose Fat', 'Increase Strength', 'Improve Endurance', 'Get Toned', 'General Fitness']
const LEVELS = ['beginner', 'intermediate', 'advanced']
const DAY_OPTIONS = [3, 4, 5, 6]
const EQUIPMENT = ['Full Gym', 'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Smith Machine', 'Kettlebell', 'Resistance Bands', 'Bodyweight', 'Home Equipment']

export default function WorkoutGenerator() {
  const { user, profile } = useAuth()
  const nav = useNavigate()
  const [goal, setGoal] = useState(profile?.primaryGoal || GOALS[0])
  const [level, setLevel] = useState(profile?.fitnessLevel || 'beginner')
  const [days, setDays] = useState(profile?.trainingFrequency || 3)
  const [durationDays, setDurationDays] = useState(profile?.programDurationDays || 90)
  const [equipment, setEquipment] = useState(profile?.equipment?.length ? profile.equipment : ['Full Gym'])
  const [plan, setPlan] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleEquipment(eq) {
    setEquipment(list => list.includes(eq) ? list.filter(e => e !== eq) : [...list, eq])
  }

  function generate(shuffle) {
    setSaved(false)
    const generated = generatePlan({
      daysPerWeek: days,
      equipment,
      exerciseLibrary: libraryExercises,
      fitnessLevel: level,
      shuffle,
      durationDays
    })
    setPlan(generated)
  }

  async function savePlan() {
    if (!plan) return
    setSaving(true)
    try {
      await createCustomPlan(user.uid, { ...plan, name: `${goal} — Generated Plan` })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  // Preview the first training week (7 days) rather than the full 30-day
  // schedule — enough to see the split before committing to it.
  const previewWeek = plan?.schedule?.slice(0, 7) || []

  return (
    <div className="app">
      <header>
        <button className="secondary" onClick={() => nav(-1)}>← Back</button>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div>
      </header>
      <main>
        <div className="eyebrow">SMART WORKOUT GENERATOR</div>
        <h1>Build a plan in seconds</h1>

        <div className="card">
          <div className="field"><label>Goal</label>
            <div className="chips">
              {GOALS.map(g => (
                <button key={g} className={`chip ${goal === g ? 'active' : ''}`} onClick={() => setGoal(g)}>{g}</button>
              ))}
            </div>
          </div>

          <div className="field"><label>Level</label>
            <div className="chips">
              {LEVELS.map(l => (
                <button key={l} className={`chip ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>{l}</button>
              ))}
            </div>
          </div>

          <div className="field"><label>Days per week</label>
            <div className="chips">
              {DAY_OPTIONS.map(d => (
                <button key={d} className={`chip ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>{d} Days</button>
              ))}
            </div>
          </div>

          <div className="field"><label>Program length</label>
            <div className="chips">
              {DURATION_OPTIONS.map(opt => (
                <button key={opt.days} className={`chip ${durationDays === opt.days ? 'active' : ''}`}
                  onClick={() => setDurationDays(opt.days)}>{opt.label}</button>
              ))}
            </div>
            <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              Longer programs add real progressive overload cycle over cycle, not just a longer countdown.
            </p>
          </div>

          <div className="field"><label>Equipment</label>
            <div className="chips">
              {EQUIPMENT.map(eq => (
                <button key={eq} className={`chip ${equipment.includes(eq) ? 'active' : ''}`} onClick={() => toggleEquipment(eq)}>{eq}</button>
              ))}
            </div>
          </div>

          <button className="primary" onClick={() => generate(false)}>GENERATE WORKOUT</button>
        </div>

        {plan && (
          <>
            <div className="card">
              <div className="row"><h3 style={{ margin: 0 }}>{plan.name}</h3><span className="muted">Week 1 preview</span></div>
              {previewWeek.map(day => (
                <div key={day.dayNumber} className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)', alignItems: 'flex-start' }}>
                  <div>
                    <b>Day {day.dayNumber}: {day.name}</b>
                    {!day.isRestDay && (
                      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                        {day.exerciseIds.map(e => e.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="row" style={{ gap: 8 }}>
              <button className="secondary" style={{ flex: 1 }} onClick={() => generate(true)}>REGENERATE</button>
              <button className="secondary" style={{ flex: 1 }} onClick={() => nav('/workout-builder')}>EDIT MANUALLY</button>
              <button className="primary" style={{ flex: 1, marginTop: 0 }} disabled={saving || saved} onClick={savePlan}>
                {saved ? 'SAVED ✓' : saving ? 'SAVING…' : 'SAVE PLAN'}
              </button>
            </div>
          </>
        )}
      </main>
      <TabBar active="workout" />
    </div>
  )
}
