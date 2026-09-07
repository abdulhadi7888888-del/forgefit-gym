import { useRef, useState } from 'react'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

// Two-image step demo (start position / end position), shown side by side —
// this is what covers an exercise when no video exists yet, which today is
// almost every exercise in the library. Falls back gracefully: if only one
// of the two images is set, show just that one full-width; if a legacy
// single `imageUrl` is set instead (old data shape), show that; if nothing
// at all, show the empty state.
function StepImages({ imageUrlStart, imageUrlEnd, imageUrl, alt }) {
  if (imageUrlStart && imageUrlEnd) {
    return (
      <div className="row" style={{ gap: 8, alignItems: 'stretch' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <img src={imageUrlStart} alt={`${alt} — start position`} style={{ width: '100%', borderRadius: 14, display: 'block' }} />
          <p className="muted" style={{ margin: '6px 0 0', fontSize: 12 }}>STEP 1 · START</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <img src={imageUrlEnd} alt={`${alt} — end position`} style={{ width: '100%', borderRadius: 14, display: 'block' }} />
          <p className="muted" style={{ margin: '6px 0 0', fontSize: 12 }}>STEP 2 · FINISH</p>
        </div>
      </div>
    )
  }

  const single = imageUrlStart || imageUrlEnd || imageUrl
  if (single) return <img src={single} alt={alt} style={{ width: '100%', borderRadius: 18 }} />

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>💪</div>
      <p className="muted">No demonstration media uploaded yet for this exercise.</p>
    </div>
  )
}

export default function ExerciseMedia({ imageUrl, imageUrlStart, imageUrlEnd, videoUrl, alt }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)

  if (!videoUrl) {
    return <StepImages imageUrlStart={imageUrlStart} imageUrlEnd={imageUrlEnd} imageUrl={imageUrl} alt={alt} />
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
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={imageUrl}
        muted={muted}
        loop
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
