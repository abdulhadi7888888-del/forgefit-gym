const DATA_URL = 'https://exercise-dataset.com/exercises.json'
const IMAGE_BASE = 'https://exercise-dataset.com/'

let catalogPromise = null

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

export async function findExerciseMedia({ id, name } = {}) {
  const catalog = await loadCatalog()
  if (!catalog.length) return null

  const wantedId = normalize(id).replace(/ /g, '-')
  const wantedName = normalize(name)
  const aliasId = ID_ALIASES[wantedId]
  const exact = (aliasId && catalog.find(e => normalize(e.id).replace(/ /g, '-') === aliasId))
    || catalog.find(e => normalize(e.id).replace(/ /g, '-') === wantedId)
    || catalog.find(e => normalize(e.name_en) === wantedName)

  if (!exact) {
    // Local names sometimes include a harmless descriptor that RepDB omits.
    const aliases = [
      String(name || '').replace(/^flat\s+/i, ''),
      String(name || '').replace(/^standard\s+/i, ''),
      String(name || '').replace(/^flat\s+barbell\s+/i, 'Barbell '),
      String(name || '').replace(/^flat\s+dumbbell\s+/i, 'Dumbbell ')
    ]
    const aliasMatch = aliases
      .map(normalize)
      .map(candidate => catalog.find(e => normalize(e.name_en) === candidate))
      .find(Boolean)
    if (aliasMatch) return mediaFromRecord(aliasMatch)

    const generated = slugify(name)
    const bySlug = catalog.find(e => normalize(e.id).replace(/ /g, '-') === generated)
    if (!bySlug) return null
    return mediaFromRecord(bySlug)
  }

  return mediaFromRecord(exact)
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
