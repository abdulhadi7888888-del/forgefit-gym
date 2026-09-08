export default function ExerciseThumb({ exercise, size = 58 }) {
  const src = exercise?.imageUrlStart || exercise?.imageUrl || '/exercise-images/generic-start.svg'
  return (
    <div className="thumb thumb-image" style={{ width: size, height: size }}>
      <img src={src} alt={`${exercise?.name || 'Exercise'} demonstration`} loading="lazy" decoding="async" onError={(event) => { if (event.currentTarget.src.endsWith('/exercise-images/generic-start.svg')) return; event.currentTarget.onerror = null; event.currentTarget.src = '/exercise-images/generic-start.svg' }} style={{ objectFit: 'contain', background: '#10151b', padding: 5 }} />
    </div>
  )
}
