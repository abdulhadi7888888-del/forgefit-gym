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

async function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch(DATA_URL)
      .then(r => {
        if (!r.ok) throw new Error(`Exercise catalog request failed (${r.status})`)
        return r.json()
      })
      .then(data => data.exercises || [])
      .catch(err => {
        console.warn('Exercise image catalog unavailable:', err)
        return []
      })
  }
  return catalogPromise
}

export async function findExerciseMedia({ id, name } = {}) {
  const catalog = await loadCatalog()
  if (!catalog.length) return null

  const wantedId = normalize(id).replace(/ /g, '-')
  const wantedName = normalize(name)
  const exact = catalog.find(e => normalize(e.id).replace(/ /g, '-') === wantedId)
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
