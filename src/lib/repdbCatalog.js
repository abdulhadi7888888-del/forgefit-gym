const DATA_URL = 'https://exercise-dataset.com/exercises.json'
const IMAGE_BASE = 'https://exercise-dataset.com/'

let catalogPromise = null

const BODY_LABELS = {
  chest: 'Chest', back: 'Back', shoulders: 'Shoulders', upper_arms: 'Arms',
  lower_arms: 'Forearms', upper_legs: 'Legs', lower_legs: 'Calves', core: 'Abs', full_body: 'Full Body'
}
const MUSCLE_LABELS = {
  pectoralis_major: 'Chest', latissimus_dorsi: 'Back', trapezius: 'Traps', rhomboids: 'Back',
  anterior_deltoid: 'Shoulders', lateral_deltoid: 'Shoulders', posterior_deltoid: 'Shoulders',
  biceps_brachii: 'Biceps', brachialis: 'Biceps', triceps_brachii: 'Triceps',
  forearm_flexors: 'Forearms', forearm_extensors: 'Forearms', rectus_abdominis: 'Abs',
  transverse_abdominis: 'Abs', obliques: 'Abs', erector_spinae: 'Back',
  gluteus_maximus: 'Glutes', gluteus_medius: 'Glutes', hamstrings: 'Hamstrings',
  quadriceps: 'Quads', adductors: 'Adductors', abductors: 'Glutes', gastrocnemius: 'Calves',
  soleus: 'Calves', serratus_anterior: 'Chest', hip_flexors: 'Abs'
}
const EQUIPMENT_LABELS = {
  ab_wheel: 'Ab Wheel', air_bike: 'Air Bike', barbell: 'Barbell', dumbbell: 'Dumbbell',
  cable: 'Cable', chest_press_machine: 'Chest Press Machine', chest_fly_machine: 'Chest Fly Machine',
  dip_station: 'Dip Station', dip_machine: 'Dip Machine', ez_bar: 'EZ Curl Bar', flat_bench: 'Bench',
  hack_squat: 'Hack Squat Machine', kettlebell: 'Kettlebell', lat_pulldown_machine: 'Lat Pulldown Machine',
  leg_curl: 'Leg Curl Machine', leg_extension: 'Leg Extension Machine', leg_press: 'Leg Press',
  loop_band: 'Loop Band', pec_deck: 'Pec Deck', pull_up_bar: 'Pull-Up Bar', resistance_band: 'Resistance Band',
  rower: 'Rower', shoulder_press_machine: 'Shoulder Press Machine', smith_machine: 'Smith Machine',
  stability_ball: 'Stability Ball', stationary_bike: 'Stationary Bike', treadmill: 'Treadmill',
  trap_bar: 'Trap Bar', plates: 'Weight Plate', suspension_trainer: 'Suspension Trainer',
  jump_rope: 'Jump Rope', slam_ball: 'Slam Ball', battle_rope: 'Battle Rope', sled: 'Sled',
  bodyweight: 'Bodyweight'
}

function title(value) {
  return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function mapRecord(r) {
  const flat = r?.images?.flat || {}
  const start = flat.start ? new URL(flat.start, IMAGE_BASE).href : flat.main ? new URL(flat.main, IMAGE_BASE).href : null
  const end = flat.peak ? new URL(flat.peak, IMAGE_BASE).href : flat.main ? new URL(flat.main, IMAGE_BASE).href : null
  if (!start && !end) return null
  const primary = r.primary_muscles?.[0]
  const secondary = [...(r.primary_muscles || []).slice(1), ...(r.secondary_muscles || [])]
    .map(m => MUSCLE_LABELS[m] || title(m))
    .filter(Boolean)
    .filter((m, i, a) => a.indexOf(m) === i)
  const muscle = MUSCLE_LABELS[primary] || BODY_LABELS[r.body_part] || title(r.body_part)
  const equipment = EQUIPMENT_LABELS[r.equipment] || title(r.equipment) || 'Bodyweight'
  const defaultSets = r.category === 'cardio' ? 1 : 3
  const repRange = r.category === 'cardio' ? '10-30 min' : r.difficulty === 'advanced' ? '6-10' : r.difficulty === 'beginner' ? '10-15' : '8-12'
  return {
    slug: r.id,
    name: r.name_en,
    description: r.description_en || '',
    primaryMuscle: muscle,
    secondaryMuscles: secondary,
    equipment,
    difficulty: r.difficulty || 'intermediate',
    defaultSets,
    repRange,
    restSeconds: r.category === 'cardio' ? 0 : r.difficulty === 'advanced' ? 120 : 75,
    instructions: r.instructions_en || [],
    safetyTips: r.tips_en || [],
    imageUrlStart: start,
    imageUrlEnd: end,
    imageUrl: flat.main ? new URL(flat.main, IMAGE_BASE).href : null,
    source: 'RepDB'
  }
}

export async function loadRepdbExercises() {
  if (!catalogPromise) {
    catalogPromise = (async () => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000)
      try {
        const r = await fetch(DATA_URL, { signal: controller.signal, cache: 'force-cache' })
        if (!r.ok) throw new Error(`RepDB catalog request failed (${r.status})`)
        const data = await r.json()
        return (data.exercises || []).map(mapRecord).filter(Boolean)
      } catch (err) {
        console.warn('Full exercise catalog unavailable:', err)
        return []
      } finally {
        clearTimeout(timer)
      }
    })()
  }
  return catalogPromise
}

export async function findRepdbExercise(slug) {
  const all = await loadRepdbExercises()
  return all.find(e => e.slug === slug) || null
}
