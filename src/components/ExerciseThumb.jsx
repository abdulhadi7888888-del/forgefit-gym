export default function ExerciseThumb({ exercise, size = 58 }) {
  const src = exercise?.imageUrlStart || exercise?.imageUrl || null
  if (!src) return null
  return (
    <div className="thumb thumb-image" style={{ width: size, height: size }}>
      <img src={src} alt={`${exercise.name} demonstration`} loading="lazy" decoding="async" style={{ objectFit: 'contain', background: '#10151b', padding: 5 }} />
    </div>
  )
}
