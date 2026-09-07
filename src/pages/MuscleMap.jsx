import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exercises } from '../data/exercises'
import TabBar from '../components/TabBar'

// A faceted, low-poly muscular figure (no copyrighted anatomy art, no real
// person). Coordinates live on a 200x420 canvas, mirrored around x=100 so
// each paired body part (shoulders, arms, legs) only needs to be drawn once.
// Shapes are deliberately built from an athletic, broad-shouldered silhouette
// instead of plain rectangles so the diagram reads as an adult training tool
// rather than a toy.
const CENTER = 100
const mirror = pts => pts.map(([x, y]) => [CENTER * 2 - x, y])
const pointsAttr = pts => pts.map(p => p.join(',')).join(' ')

// Shared limb shapes (right side only — left is generated with mirror()).
const DELTOID = [[112, 58], [140, 54], [150, 76], [138, 88], [118, 80], [110, 68]]
const UPPER_ARM = [[150, 76], [158, 96], [154, 122], [140, 126], [136, 100], [138, 88]]
const FOREARM = [[154, 122], [160, 148], [150, 162], [138, 150], [140, 126]]
const THIGH = [[132, 196], [146, 220], [140, 270], [118, 278], [108, 240], [112, 206]]
const HAM = [[130, 214], [144, 222], [138, 270], [118, 278], [108, 242], [114, 214]]
const CALF = [[140, 270], [146, 310], [132, 340], [116, 332], [112, 290], [118, 278]]
const FOOT = [[132, 340], [138, 352], [120, 358], [108, 350], [116, 332]]

// Decorative (non-clickable) shapes — give the figure continuity without
// implying they're their own trackable muscle group.
const HEAD = { cx: 100, cy: 26, rx: 17, ry: 20 }
const NECK = [[90, 44], [110, 44], [112, 72], [88, 72]]
const HIP_SADDLE = [[112, 178], [122, 194], [100, 202], [78, 194], [88, 178]]

const CHEST = [[112, 68], [138, 88], [132, 122], [100, 130], [68, 122], [62, 88], [88, 68]]
const ABS = [[118, 128], [122, 150], [112, 178], [100, 184], [88, 178], [78, 150], [82, 128], [100, 136]]
const TRAPS = [[100, 44], [140, 54], [122, 80], [100, 90], [78, 80], [60, 54]]
const UPPER_BACK = [[100, 90], [122, 80], [138, 88], [130, 150], [112, 192], [100, 198], [88, 192], [70, 150], [62, 88], [78, 80]]
const GLUTES = [[112, 192], [122, 214], [100, 224], [78, 214], [88, 192], [100, 198]]

const FRONT_MUSCLES = [
  { muscle: 'Shoulders', points: DELTOID }, { muscle: 'Shoulders', points: mirror(DELTOID) },
  { muscle: 'Chest', points: CHEST },
  { muscle: 'Biceps', points: UPPER_ARM }, { muscle: 'Biceps', points: mirror(UPPER_ARM) },
  { muscle: 'Forearms', points: FOREARM }, { muscle: 'Forearms', points: mirror(FOREARM) },
  { muscle: 'Abs', points: ABS },
  { muscle: 'Legs', points: THIGH }, { muscle: 'Legs', points: mirror(THIGH) },
  { muscle: 'Calves', points: CALF }, { muscle: 'Calves', points: mirror(CALF) }
]

const BACK_MUSCLES = [
  { muscle: 'Traps', points: TRAPS },
  { muscle: 'Shoulders', points: DELTOID }, { muscle: 'Shoulders', points: mirror(DELTOID) },
  { muscle: 'Back', points: UPPER_BACK },
  { muscle: 'Triceps', points: UPPER_ARM }, { muscle: 'Triceps', points: mirror(UPPER_ARM) },
  { muscle: 'Forearms', points: FOREARM }, { muscle: 'Forearms', points: mirror(FOREARM) },
  { muscle: 'Glutes', points: GLUTES },
  { muscle: 'Legs', points: HAM }, { muscle: 'Legs', points: mirror(HAM) },
  { muscle: 'Calves', points: CALF }, { muscle: 'Calves', points: mirror(CALF) }
]

const DECORATIVE = [
  { shape: 'ellipse', ...HEAD },
  { shape: 'polygon', points: NECK },
  { shape: 'polygon', points: HIP_SADDLE },
  { shape: 'polygon', points: FOOT }, { shape: 'polygon', points: mirror(FOOT) }
]

function BodyFigure({ regions, selected, onSelect }) {
  return (
    <svg viewBox="0 0 200 420" width="100%" height="100%" style={{ display: 'block' }}>
      {DECORATIVE.map((d, i) => d.shape === 'ellipse'
        ? <ellipse key={i} cx={d.cx} cy={d.cy} rx={d.rx} ry={d.ry} fill="var(--card2)" stroke="var(--line)" strokeWidth="1.5" />
        : <polygon key={i} points={pointsAttr(d.points)} fill="var(--card2)" stroke="var(--line)" strokeWidth="1.5" />
      )}
      {regions.map((r, i) => (
        <polygon
          key={i}
          points={pointsAttr(r.points)}
          onClick={() => onSelect(r.muscle)}
          stroke="var(--line)"
          strokeWidth="1.5"
          fill={selected === r.muscle ? 'var(--accent)' : 'var(--card)'}
          style={{ cursor: 'pointer', transition: 'fill .12s' }}
        >
          <title>{r.muscle}</title>
        </polygon>
      ))}
    </svg>
  )
}

export default function MuscleMap() {
  const [view, setView] = useState('front')
  const [selected, setSelected] = useState(null)
  const nav = useNavigate()

  const regions = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES
  const relevant = selected ? exercises.filter(e => e.primaryMuscle === selected) : []

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">MUSCLE MAP</div>
        <h1>Tap a muscle</h1>

        <div className="chips">
          <button className={`chip ${view === 'front' ? 'active' : ''}`} onClick={() => setView('front')}>Front</button>
          <button className={`chip ${view === 'back' ? 'active' : ''}`} onClick={() => setView('back')}>Back</button>
        </div>

        <div className="card" style={{ height: 380, padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '52%', maxWidth: 210 }}>
            <BodyFigure regions={regions} selected={selected} onSelect={setSelected} />
          </div>
        </div>

        {selected && (
          <div className="card">
            <h3 style={{ marginTop: 0 }}>{selected}</h3>
            {relevant.length === 0 && <p className="muted">No exercises tagged for this muscle yet.</p>}
            {relevant.map(e => (
              <div key={e.slug} className="exercise" onClick={() => nav(`/exercises/${e.slug}`)}>
                <div className="thumb">💪</div>
                <div style={{ flex: 1 }}><h3>{e.name}</h3><p>{e.equipment}</p></div>
                <span>›</span>
              </div>
            ))}
          </div>
        )}
      </main>
      <TabBar active="exercises" />
    </div>
  )
}
