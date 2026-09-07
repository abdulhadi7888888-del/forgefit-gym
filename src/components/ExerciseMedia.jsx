import { useRef, useState } from 'react'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

function StepImage({ src, alt, label }) {
  if (!src) return null
  return (
    <div className="exercise-step">
      <div className="exercise-visual">
        <img src={src} alt={`${alt} — ${label.toLowerCase()}`} loading="eager" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none' }} />
      </div>
        <p>{label}</p><small className="media-caption">REALISTIC GYM DEMO</small>
    </div>
  )
}

function StepImages({ imageUrlStart, imageUrlEnd, imageUrl, alt }) {
  const start = imageUrlStart || imageUrl
  const end = imageUrlEnd || imageUrlStart || imageUrl

  if (start || end) {
    return (
      <section className="exercise-demo" aria-label={`${alt} demonstration`}>
        <div className="exercise-steps">
          <StepImage src={start} alt={alt} label="STEP 1 · START" />
          <StepImage src={end} alt={alt} label="STEP 2 · FINISH" />
        </div>
      </section>
    )
  }

  if (imageUrl) {
    return (
      <section className="exercise-demo" aria-label={`${alt} demonstration`}>
        <div className="exercise-single">
          <StepImage src={imageUrl} alt={alt} label="EXERCISE" />
        </div>
      </section>
    )
  }

  return null
}

export default function ExerciseMedia({ imageUrl, imageUrlStart, imageUrlEnd, videoUrl, alt }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)

  if (!videoUrl) {
    return <StepImages
      imageUrlStart={imageUrlStart}
      imageUrlEnd={imageUrlEnd}
      imageUrl={imageUrl}
      alt={alt}
    />
  }

  function togglePlay() {
    if (!videoRef.current) return
    if (playing) videoRef.current.pause()
    else videoRef.current.play()
    setPlaying(!playing)
  }

  function changeSpeed(s) {
    setSpeed(s)
    if (videoRef.current) videoRef.current.playbackRate = s
  }

  function onTimeUpdate() {
    const v = videoRef.current
    if (v && v.duration) setProgress((v.currentTime / v.duration) * 100)
  }

  function seek(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    if (videoRef.current) videoRef.current.currentTime = pct * videoRef.current.duration
  }

  function toggleFullscreen() {
    videoRef.current?.requestFullscreen?.()
  }

  return (
    <div className="exercise-video card" style={{ padding: 0, overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={imageUrl}
        muted={muted}
        loop
        playsInline
        onTimeUpdate={onTimeUpdate}
        onClick={togglePlay}
        style={{ width: '100%', display: 'block', borderRadius: '22px 22px 0 0' }}
      />
      <div style={{ padding: 14 }}>
        <div className="progressbar" style={{ cursor: 'pointer' }} onClick={seek}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="secondary" onClick={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
          <button className="secondary" onClick={() => setMuted(m => !m)}>{muted ? 'Unmute' : 'Mute'}</button>
          <button className="secondary" onClick={toggleFullscreen}>Fullscreen</button>
        </div>
        <div className="chips" style={{ marginTop: 8 }}>
          {SPEEDS.map(s => (
            <button key={s} className={`chip ${speed === s ? 'active' : ''}`} onClick={() => changeSpeed(s)}>{s}x</button>
          ))}
        </div>
      </div>
    </div>
  )
}
