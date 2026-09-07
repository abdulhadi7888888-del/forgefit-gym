import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveOnboarding } from '../lib/data'
import { DURATION_OPTIONS } from '../lib/planGenerator'

const GOALS = ['Build Muscle', 'Lose Fat', 'Increase Strength', 'Improve Endurance', 'Get Toned', 'General Fitness']
const EQUIPMENT = ['Full Gym', 'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Smith Machine', 'Kettlebell', 'Resistance Bands', 'Bodyweight', 'Home Equipment']
const LEVELS = ['beginner', 'intermediate', 'advanced']

export default function Onboarding() {
  const { user, setProfile } = useAuth()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', gender: '', age: '', heightCm: '', startingWeightKg: '',
    fitnessLevel: 'beginner', primaryGoal: '', trainingFrequency: 3, equipment: [],
    programDurationDays: 90
  })

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleEquipment(item) {
    setForm(f => ({
      ...f,
      equipment: f.equipment.includes(item) ? f.equipment.filter(e => e !== item) : [...f.equipment, item]
    }))
  }

  async function finish() {
    const data = {
      ...form,
      age: Number(form.age),
      heightCm: Number(form.heightCm),
      startingWeightKg: Number(form.startingWeightKg),
      currentWeightKg: Number(form.startingWeightKg),
      goalWeightKg: null
    }
    await saveOnboarding(user.uid, data)
    setProfile({ ...data, onboardingComplete: true })
    nav('/')
  }

  const steps = [
    <Intro key="intro" />,
    <BasicInfo key="basic" form={form} update={update} />,
    <GoalStep key="goal" form={form} update={update} />,
    <DurationStep key="duration" form={form} update={update} />,
    <EquipmentStep key="equip" form={form} toggleEquipment={toggleEquipment} />
  ]

  return (
    <div className="app">
      <main>
        {steps[step]}
        <div className="row" style={{ marginTop: 20 }}>
          {step > 0 && <button className="secondary" onClick={() => setStep(s => s - 1)}>BACK</button>}
          {step < steps.length - 1
            ? <button className="primary" onClick={() => setStep(s => s + 1)}>CONTINUE</button>
            : <button className="primary" onClick={finish} disabled={!form.name || !form.primaryGoal}>FINISH SETUP</button>}
        </div>
      </main>
    </div>
  )
}

function Intro() {
  return (
    <div>
      <div className="eyebrow">WELCOME</div>
      <h1>Build Your<br />Strongest Self</h1>
      <p className="muted">A few quick questions so your plan actually fits you — takes about a minute.</p>
    </div>
  )
}

function BasicInfo({ form, update }) {
  return (
    <div>
      <div className="eyebrow">ABOUT YOU</div>
      <h1>Tell us about yourself</h1>
      <div className="field"><label>Name</label>
        <input className="search" value={form.name} onChange={e => update('name', e.target.value)} /></div>
      <div className="field"><label>Gender</label>
        <select className="search" value={form.gender} onChange={e => update('gender', e.target.value)}>
          <option value="">Select</option>
          <option value="male">Male</option><option value="female">Female</option>
          <option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option>
        </select></div>
      <div className="row">
        <div className="field" style={{ flex: 1 }}><label>Age</label>
          <input className="search" type="number" value={form.age} onChange={e => update('age', e.target.value)} /></div>
        <div className="field" style={{ flex: 1 }}><label>Height (cm)</label>
          <input className="search" type="number" value={form.heightCm} onChange={e => update('heightCm', e.target.value)} /></div>
      </div>
      <div className="field"><label>Current weight (kg)</label>
        <input className="search" type="number" value={form.startingWeightKg} onChange={e => update('startingWeightKg', e.target.value)} /></div>
      <div className="field"><label>Training experience</label>
        <select className="search" value={form.fitnessLevel} onChange={e => update('fitnessLevel', e.target.value)}>
          {LEVELS.map(l => <option key={l} value={l}>{l[0].toUpperCase() + l.slice(1)}</option>)}
        </select></div>
    </div>
  )
}

function GoalStep({ form, update }) {
  return (
    <div>
      <div className="eyebrow">GOAL</div>
      <h1>What's your primary goal?</h1>
      <div className="chips" style={{ flexWrap: 'wrap' }}>
        {GOALS.map(g => (
          <button key={g} className={`chip ${form.primaryGoal === g ? 'active' : ''}`}
            onClick={() => update('primaryGoal', g)}>{g}</button>
        ))}
      </div>
      <div className="field" style={{ marginTop: 20 }}>
        <label>Training frequency (days/week)</label>
        <select className="search" value={form.trainingFrequency}
          onChange={e => update('trainingFrequency', Number(e.target.value))}>
          {[2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} days/week</option>)}
        </select>
      </div>
    </div>
  )
}

function DurationStep({ form, update }) {
  return (
    <div>
      <div className="eyebrow">COMMITMENT</div>
      <h1>How long are you training for?</h1>
      <p className="muted">
        This isn't just a countdown — a longer program actually loads you up more over time.
        Every 30-day cycle builds on the last one: more reps, then more sets, so month 6 or
        month 12 is genuinely heavier than day 1, not the same month on repeat.
      </p>
      <div className="chips" style={{ flexWrap: 'wrap' }}>
        {DURATION_OPTIONS.map(opt => (
          <button key={opt.days} className={`chip ${form.programDurationDays === opt.days ? 'active' : ''}`}
            onClick={() => update('programDurationDays', opt.days)}>{opt.label}</button>
        ))}
      </div>
    </div>
  )
}

function EquipmentStep({ form, toggleEquipment }) {
  return (
    <div>
      <div className="eyebrow">EQUIPMENT</div>
      <h1>What do you have access to?</h1>
      <p className="muted">Select all that apply.</p>
      <div className="chips" style={{ flexWrap: 'wrap' }}>
        {EQUIPMENT.map(eq => (
          <button key={eq} className={`chip ${form.equipment.includes(eq) ? 'active' : ''}`}
            onClick={() => toggleEquipment(eq)}>{eq}</button>
        ))}
      </div>
    </div>
  )
}
