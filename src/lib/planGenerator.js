const TEMPLATES = {
  2: [['Full Body', ['Chest', 'Back', 'Legs']], ['Full Body', ['Shoulders', 'Legs', 'Glutes', 'Abs']]],
  3: [['Push', ['Chest', 'Shoulders', 'Triceps']], ['Pull', ['Back', 'Traps', 'Biceps']], ['Legs', ['Legs', 'Glutes', 'Calves', 'Abs']]],
  4: [['Chest & Triceps', ['Chest', 'Triceps']], ['Back & Biceps', ['Back', 'Traps', 'Biceps']],
      ['Legs', ['Legs', 'Glutes', 'Calves']], ['Shoulders & Abs', ['Shoulders', 'Abs']]],
  5: [
    ['Upper', ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps']],
    ['Lower', ['Legs', 'Glutes', 'Calves']],
    ['Push', ['Chest', 'Shoulders', 'Triceps']],
    ['Pull', ['Back', 'Traps', 'Biceps', 'Forearms']],
    ['Legs', ['Legs', 'Glutes', 'Calves', 'Abs']]
  ],
  6: [['Push', ['Chest', 'Shoulders', 'Triceps']], ['Pull', ['Back', 'Traps', 'Biceps']], ['Legs', ['Legs', 'Glutes', 'Calves']],
      ['Push', ['Chest', 'Shoulders', 'Triceps']], ['Pull', ['Back', 'Biceps', 'Forearms']], ['Legs', ['Legs', 'Glutes', 'Abs']]],
  7: [['Push', ['Chest', 'Shoulders', 'Triceps']], ['Pull', ['Back', 'Traps', 'Biceps']], ['Legs', ['Legs', 'Glutes', 'Calves']],
      ['Push', ['Chest', 'Shoulders', 'Triceps']], ['Pull', ['Back', 'Biceps', 'Forearms']], ['Legs', ['Legs', 'Glutes', 'Abs']],
      ['Full Body', ['Chest', 'Back', 'Legs', 'Abs']]]
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// The onboarding equipment picker offers a couple of convenience presets
// ('Full Gym', 'Home Equipment') instead of making users tick every single
// machine type. Expand those into the concrete equipment values actually
// used in the exercise library (see src/data/exercises.js) before filtering,
// otherwise 'Full Gym' would match nothing and every plan would fall back to
// bodyweight-only exercises.
const EQUIPMENT_PRESETS = {
  'Full Gym': ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Smith Machine', 'Cardio Equipment',
    'EZ-Bar', 'Kettlebell', 'Pec Deck Machine', 'T-Bar', 'Ab Wheel', 'Plates', 'Foam Roller',
    'Resistance Bands', 'Bodyweight'],
  'Home Equipment': ['Dumbbell', 'Resistance Bands', 'Kettlebell', 'Bodyweight']
}

function expandEquipment(equipment) {
  return equipment.flatMap(e => EQUIPMENT_PRESETS[e] || [e])
}

// A real program isn't the same split repeated at the same weight forever —
// the point is progressive overload. The program is built out of 30-day
// "cycles": 4 weekly phases (Foundation, Build, Intensify, Deload) plus a
// 2-day retest block, exactly like the original 30-day program. Longer
// programs (3/6/12 months) are just more of these cycles back to back, with
// each new cycle starting from a higher baseline than the last — that
// cumulative overload (see cumulativeOverload below) is what actually makes
// month 6 different from day 1, instead of the same loop on repeat.
const CYCLE_LENGTH_DAYS = 30

export const DURATION_OPTIONS = [
  { days: 30, label: '30 Days', short: '30-Day' },
  { days: 90, label: '3 Months', short: '3-Month' },
  { days: 180, label: '6 Months', short: '6-Month' },
  { days: 360, label: '12 Months', short: '12-Month' }
]

export function durationLabel(days) {
  const match = DURATION_OPTIONS.find(d => d.days === days)
  if (match) return match.short
  const cycles = Math.max(1, Math.round(days / CYCLE_LENGTH_DAYS))
  return `${cycles}-Cycle`
}

const PHASE_CONFIG = [
  { phase: 'Foundation', setDelta: 0, repShift: 0,
    note: 'Learn the movement. Pick a weight you can control with 1-2 reps left in the tank.' },
  { phase: 'Build', setDelta: 0, repShift: 0,
    note: 'Add a little weight from last week (~2.5–5%) if every rep felt solid.' },
  { phase: 'Intensify', setDelta: 1, repShift: -2,
    note: 'Go heavier, 1-2 fewer reps per set than Build week.' },
  { phase: 'Deload', setDelta: -1, repShift: 2,
    note: 'Deload — lighter weight, easy reps. Let your body recover before the retest.' }
]

// Cumulative overload across cycles: every completed 30-day cycle nudges the
// baseline up a little further, on top of the within-cycle phase swing
// above. Reps grow for the first few cycles (better work capacity at a given
// weight = you've gotten stronger), then sets grow every couple of cycles
// after that (more total work once rep growth alone isn't a fair progression
// signal anymore). Caps exist so the plan never asks for something silly
// after a year of training — capacity gains show up as heavier weight the
// person chooses on the day, which the app can't prescribe for them.
const REP_BONUS_PER_CYCLE = 1
const MAX_REP_BONUS = 4
const SET_BONUS_EVERY_N_CYCLES = 2
const MAX_SET_BONUS = 2

function cumulativeOverload(cycleIndex) {
  return {
    repBonus: Math.min(MAX_REP_BONUS, cycleIndex * REP_BONUS_PER_CYCLE),
    setBonus: Math.min(MAX_SET_BONUS, Math.floor(cycleIndex / SET_BONUS_EVERY_N_CYCLES))
  }
}

function phaseNote(phaseConfig, cycleIndex) {
  if (cycleIndex === 0) return phaseConfig.note
  return `${phaseConfig.note} You've completed ${cycleIndex} cycle${cycleIndex > 1 ? 's' : ''} — you should be moving more than you were back in cycle 1.`
}

function retestNote(cycleIndex) {
  return cycleIndex === 0
    ? 'Try to beat the weight you used for this exercise on Day 1, same rep count.'
    : `Try to beat the weight you used for this exercise at the end of the last cycle, same rep count.`
}

function shiftRepRange(repRange, shift) {
  const [lo, hi] = String(repRange).split('-').map(Number)
  if (!lo || !hi) return repRange
  const newLo = Math.max(1, lo + shift)
  const newHi = Math.max(newLo + 1, hi + shift)
  return `${newLo}-${newHi}`
}

function applyPhase(base, phaseConfig, cycleIndex) {
  const { repBonus, setBonus } = cumulativeOverload(cycleIndex)
  return {
    ...base,
    sets: Math.max(2, base.sets + phaseConfig.setDelta + setBonus),
    repRange: shiftRepRange(base.repRange, phaseConfig.repShift + repBonus),
    progressionNote: phaseNote(phaseConfig, cycleIndex)
  }
}

// `shuffle` lets the interactive Smart Workout Generator's "Regenerate"
// button produce a genuinely different pick each time (a different exercise
// per muscle group) instead of the same deterministic slice. Onboarding's
// automatic 30-day program never passes it, so that flow stays deterministic.
function pickExercisesForDay(available, muscles, perMuscle, shuffle, rotation = 0) {
  return muscles.flatMap((m, muscleIndex) => {
    const pool = available.filter(e => e.primaryMuscle === m)
    if (!pool.length) return []
    const ordered = shuffle ? [...pool].sort(() => Math.random() - 0.5) : pool
    // Rotate through the exercise library as the weeks progress so a 5-day
    // program does not prescribe the exact same movement every week.
    const start = ordered.length ? (rotation + muscleIndex) % ordered.length : 0
    const rotated = [...ordered.slice(start), ...ordered.slice(0, start)]
    return rotated.slice(0, perMuscle)
  }).slice(0, 7)
}

// Spreads `count` training days evenly across a 7-day week (e.g. 3/week ->
// roughly Mon/Wed/Fri spacing) so rest days land between sessions instead of
// bunching up.
function spreadTrainingDays(daysPerWeek) {
  const n = Math.min(7, Math.max(1, daysPerWeek))
  // Keep the common 5-day split easy to understand: Monday-Friday training,
  // Saturday-Sunday recovery. Other frequencies are distributed across the week.
  if (n === 5) return new Set([0, 1, 2, 3, 4])
  if (n === 6) return new Set([0, 1, 2, 3, 4, 5])
  if (n === 7) return new Set([0, 1, 2, 3, 4, 5, 6])
  const slots = new Set()
  for (let i = 0; i < n; i++) slots.add(Math.round(i * 7 / n))
  return slots
}

// Builds a real multi-cycle schedule object (see workoutPlans schema) from
// the exercise library, filtered by the equipment the user actually has,
// with week-by-week AND cycle-by-cycle progression instead of a flat
// repeating split. `durationDays` should normally be one of
// DURATION_OPTIONS (30/90/180/360) — picking 12 months instead of 30 days
// doesn't just make the app run longer, it changes what's actually
// prescribed: more cycles means more accumulated overload (see
// cumulativeOverload) by the time the person gets there.
export function generatePlan({ daysPerWeek, equipment, exerciseLibrary, fitnessLevel, shuffle, durationDays = 30 }) {
  const template = TEMPLATES[daysPerWeek] || TEMPLATES[3]
  const owned = expandEquipment(equipment)
  const available = exerciseLibrary.filter(e => owned.length === 0 || owned.includes(e.equipment) || e.equipment === 'Bodyweight')
  const trainingSlots = spreadTrainingDays(daysPerWeek)
  const totalDays = Math.max(CYCLE_LENGTH_DAYS, Math.round(durationDays))
  const totalCycles = Math.ceil(totalDays / CYCLE_LENGTH_DAYS)

  const schedule = []
  let templateIndex = 0

  for (let dayNumber = 1; dayNumber <= totalDays; dayNumber++) {
    const cycleIndex = Math.floor((dayNumber - 1) / CYCLE_LENGTH_DAYS)
    const dayInCycle = (dayNumber - 1) % CYCLE_LENGTH_DAYS // 0-based, 0-29
    const isRetestDay = dayInCycle >= CYCLE_LENGTH_DAYS - 2
    const weekIndex = Math.min(3, Math.floor(dayInCycle / 7))
    const slotInWeek = dayInCycle % 7
    const phaseConfig = PHASE_CONFIG[weekIndex]

    if (isRetestDay) {
      const [label, muscles] = template[templateIndex % template.length]
      const picked = pickExercisesForDay(available, muscles, 2, shuffle, dayNumber + cycleIndex * 3)
      templateIndex++
      const { setBonus } = cumulativeOverload(cycleIndex)
      schedule.push({
        dayNumber, week: 4, cycle: cycleIndex + 1, phase: 'Retest',
        name: `Retest: ${label}`,
        isRestDay: picked.length === 0,
        exerciseIds: picked.map(e => ({
          exerciseId: e.slug, name: e.name,
          sets: 3 + setBonus, repRange: '3-5', restSeconds: e.restSeconds,
          progressionNote: retestNote(cycleIndex)
        }))
      })
      continue
    }

    if (!trainingSlots.has(slotInWeek)) {
      schedule.push({
        dayNumber, week: weekIndex + 1, cycle: cycleIndex + 1, phase: phaseConfig.phase,
        name: 'Rest', isRestDay: true, exerciseIds: []
      })
      continue
    }

    const [label, muscles] = template[templateIndex % template.length]
    templateIndex++
    const picked = pickExercisesForDay(available, muscles, muscles.length > 1 ? 2 : 4, shuffle, dayNumber + cycleIndex * 3)
    schedule.push({
      dayNumber, week: weekIndex + 1, cycle: cycleIndex + 1, phase: phaseConfig.phase,
      name: label, isRestDay: false,
      exerciseIds: picked.map(e => applyPhase({
        exerciseId: e.slug, name: e.name, sets: e.defaultSets,
        repRange: e.repRange, restSeconds: e.restSeconds
      }, phaseConfig, cycleIndex))
    })
  }

  return {
    name: `${durationLabel(totalDays)} ${fitnessLevel} Progression`,
    daysPerWeek, totalDays, totalCycles, schedule, splitVersion: 3
  }
}

// Which day of the 30-day program "today" is, based on when the plan was
// created — day 1 is creation day, and it counts forward with real calendar
// days (rest days included) rather than counting only workouts completed.
export function getProgramDay(plan) {
  if (!plan?.createdAt?.toDate) return 1
  const start = plan.createdAt.toDate()
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((today - startDay) / 86400000)
  return diffDays + 1
}

export function todaysWorkout(plan) {
  if (!plan) return null
  // Custom single-day plans from the Workout Builder aren't tied to a
  // calendar day (schedule[0].day === 'custom') — always startable.
  if (plan.schedule.length === 1 && plan.schedule[0].day === 'custom') {
    return plan.schedule[0]
  }
  // New 30-day progressive plans key each entry by dayNumber.
  if (plan.schedule[0]?.dayNumber) {
    const programDay = getProgramDay(plan)
    if (programDay > (plan.totalDays || 30)) return null
    return plan.schedule.find(d => d.dayNumber === programDay) || null
  }
  // Legacy weekday-based plans from before the 30-day progression existed.
  const todayName = DAY_NAMES[(new Date().getDay() + 6) % 7].toLowerCase()
  return plan.schedule.find(d => d.day === todayName) || null
}
