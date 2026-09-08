const IMAGE_BASE = 'https://exercise-dataset.com/'
const CDN_BASE = (import.meta.env.VITE_EXERCISE_MEDIA_BASE || '').replace(/\/$/, '')

const LOCAL_FALLBACKS = {
  chest: ['lying-press-start.svg', 'lying-press-end.svg'],
  push: ['pushup-start.svg', 'pushup-end.svg'],
  pull: ['row-start.svg', 'row-end.svg'],
  hinge: ['hinge-start.svg', 'hinge-end.svg'],
  lower: ['squat-start.svg', 'squat-end.svg'],
  core: ['crunch-start.svg', 'crunch-end.svg'],
  carry: ['carry-start.svg', 'carry-end.svg'],
  mobility: ['stretch-start.svg', 'stretch-end.svg'],
  generic: ['generic-start.svg', 'generic-end.svg']
}

function familyFor(value) {
  if (/push.?up|burpee|dip/.test(value)) return 'push'
  if (/bench|press|fly|chest/.test(value)) return 'chest'
  if (/row|pull|pulldown|lat|shrug|rear.?delt/.test(value)) return 'pull'
  if (/deadlift|rdl|hinge|good.?morning|swing/.test(value)) return 'hinge'
  if (/squat|lunge|leg|calf|glute|hamstring|step.?up/.test(value)) return 'lower'
  if (/plank|crunch|sit.?up|ab|mountain/.test(value)) return 'core'
  if (/carry|farmer|hold/.test(value)) return 'carry'
  if (/stretch|mobility|roll/.test(value)) return 'mobility'
  return 'generic'
}

function assetSlug({ id, name } = {}) {
  return slugify(id || name || 'exercise')
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function slugify(value) {
  return normalize(value).replace(/\s+/g, '-')
}

// The app uses clearer user-facing variant names than the RepDB catalog.
// These aliases make the catalog image appear for the common bench-press
// variants instead of falling back to the local demo diagram.
const ID_ALIASES = {
  // User-facing names used by ForgeFit -> canonical RepDB ids.
  'dumbbell-overhead-press': 'dumbbell-shoulder-press',
  'barbell-overhead-press': 'barbell-overhead-press',
  'machine-overhead-press': 'machine-shoulder-press',
  'seated-dumbbell-press': 'seated-db-press',
  'dumbbell-lateral-raise': 'dumbbell-lateral-raise',
  'dumbbell-front-raise': 'dumbbell-front-raise',
  'dumbbell-rear-delt-fly': 'rear-delt-fly',
  'dumbbell-curl': 'dumbbell-bicep-curl',
  'barbell-curl': 'barbell-curl',
  'triceps-pushdown-rope': 'cable-tricep-pushdown',
  'triceps-pushdown-straight-bar': 'cable-tricep-pushdown',
  'overhead-triceps-extension': 'overhead-tricep-extension',
  'back-squat': 'barbell-back-squat',
  'goblet-squat': 'goblet-squat',
  'walking-lunge': 'walking-lunge',
  'standing-calf-raise': 'standing-calf-raise',
  'seated-calf-raise': 'seated-calf-raise',
  'hanging-leg-raise': 'hanging-leg-raise',
  'ab-wheel-rollout': 'ab-wheel-rollout',
  'plank': 'high-plank',
  'flat-barbell-bench-press': 'bench-press',
  'flat-dumbbell-bench-press': 'db-bench-press',
  'flat-smith-machine-bench-press': 'smith-machine-bench-press',
  'flat-machine-bench-press': 'chest-press-machine',
  'incline-barbell-bench-press': 'incline-bench-press',
  'incline-dumbbell-bench-press': 'incline-db-bench-press',
  'incline-smith-machine-bench-press': 'smith-machine-incline-bench-press',
  'incline-machine-bench-press': 'incline-machine-chest-press',
  'decline-barbell-bench-press': 'decline-bench-press-barbell',
  'decline-dumbbell-bench-press': 'decline-bench-press-db',
  'decline-smith-machine-bench-press': 'smith-machine-decline-bench-press',
  'decline-machine-bench-press': 'decline-machine-chest-press',
}

async function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = (async () => {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 6000)
      try {
        const r = await fetch(DATA_URL, { signal: controller.signal, cache: 'force-cache' })
        if (!r.ok) throw new Error(`Exercise catalog request failed (${r.status})`)
        const data = await r.json()
        return data.exercises || []
      } catch (err) {
        console.warn('Exercise image catalog unavailable:', err)
        return []
      } finally {
        clearTimeout(timer)
      }
    })()
  }
  return catalogPromise
}

export function resolveExerciseMedia({ id, name } = {}) {
  const slug = assetSlug({ id, name })
  const family = familyFor(`${id || ''} ${name || ''}`.toLowerCase())
  const [startFile, endFile] = LOCAL_FALLBACKS[family]
  const remote = CDN_BASE ? `${CDN_BASE}/${slug}` : null
  return {
    imageUrlStart: remote ? `${remote}/start.webp` : `/exercise-images/${startFile}`,
    imageUrlEnd: remote ? `${remote}/finish.webp` : `/exercise-images/${endFile}`,
    imageUrl: remote ? `${remote}/start.webp` : `/exercise-images/${startFile}`,
    source: remote ? 'ForgeFit exercise media CDN' : 'ForgeFit local fallback',
    mediaSlug: slug,
    mediaFamily: family
  }
}

export async function findExerciseMedia(input = {}) {
  return resolveExerciseMedia(input)
}

export function validateExerciseMedia(exercises = []) {
  const slugs = exercises.map(exercise => assetSlug(exercise))
  const duplicateSlugs = [...new Set(slugs.filter((slug, index) => slugs.indexOf(slug) !== index))]
  return {
    total: exercises.length,
    missing: exercises.filter(exercise => !exercise?.slug && !exercise?.name).map(exercise => exercise?.name || 'unknown'),
    duplicateSlugs,
    covered: duplicateSlugs.length === 0 && exercises.every(exercise => Boolean(assetSlug(exercise)))
  }
}

function localMediaFor(input = {}) {
  return resolveExerciseMedia(input)
}

function mediaFromRecord(record) {
  const flat = record?.images?.flat
  if (!flat) return null
  return {
    imageUrlStart: flat.start ? new URL(flat.start, IMAGE_BASE).href : flat.main ? new URL(flat.main, IMAGE_BASE).href : null,
    imageUrlEnd: flat.peak ? new URL(flat.peak, IMAGE_BASE).href : flat.main ? new URL(flat.main, IMAGE_BASE).href : null,
    imageUrl: flat.main ? new URL(flat.main, IMAGE_BASE).href : null,
    source: 'RepDB'
  }
}

export function directExerciseImageUrl(id, position = 'start') {
  if (!id) return null
  return `${IMAGE_BASE}images/flat/${id}-${position}.webp`
}
