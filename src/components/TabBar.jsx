import { Link } from 'react-router-dom'

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9.5v-6h5v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  ),
  workout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5v11M17.5 6.5v11" />
      <path d="M3.5 9.5v5M20.5 9.5v5" />
      <path d="M6.5 12h11" />
    </svg>
  ),
  exercises: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5V15M9.5 19.5v-8M15 19.5V9M20 19.5V5" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </svg>
  )
}

const TABS = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'workout', label: 'Workout', path: '/workout-builder' },
  { id: 'exercises', label: 'Exercises', path: '/exercises' },
  { id: 'progress', label: 'Progress', path: '/progress' },
  { id: 'profile', label: 'Profile', path: '/profile' }
]

export default function TabBar({ active }) {
  return (
    <nav className="tabs">
      <div className="tabs-inner">
        {TABS.map(t => (
          <Link
            key={t.id}
            to={t.path}
            className={`tab ${active === t.id ? 'active' : ''}`}
            aria-current={active === t.id ? 'page' : undefined}
          >
            <span className="tab-icon">{ICONS[t.id]}</span>
            <span className="tab-label">{t.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
