import { useEffect, useState } from 'react'
import { findExerciseMedia } from '../lib/exerciseMedia'

export default function ExerciseThumb({ exercise, size = 58 }) {
  const localStart = exercise?.imageUrlStart || exercise?.imageUrl || null
  const [remote, setRemote] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    setRemote(null)
    if (!exercise?.name && !exercise?.slug) return undefined
    findExerciseMedia({ id: exercise.slug, name: exercise.name }).then(media => {
      if (!cancelled && media) setRemote(media.imageUrlStart || media.imageUrl || null)
    })
    return () => { cancelled = true }
  }, [exercise?.slug, exercise?.name])

  const src = failed ? localStart : (remote || localStart)
  if (!src) return null
  return (
    <div className="thumb thumb-image" style={{ width: size, height: size }}>
      <img src={src} alt={`${exercise.name} demonstration`} loading="lazy" onError={() => setFailed(true)} />
    </div>
  )
}
