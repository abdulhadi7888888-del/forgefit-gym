import { Link } from 'react-router-dom'
import { useLanguage } from '../lib/i18n'

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
  { id: 'home', key: 'nav_home', path: '/' },
  { id: 'workout', key: 'nav_workout', path: '/workout-builder' },
  { id: 'exercises', key: 'nav_exercises', path: '/exercises' },
  { id: 'progress', key: 'nav_progress', path: '/progress' },
  { id: 'profile', key: 'nav_profile', path: '/profile' }
]

export default function TabBar({ active }) {
  const { t } = useLanguage()
  return (
    <nav className="tabs">
      <div className="tabs-inner">
        {TABS.map(t2 => (
          <Link
            key={t2.id}
            to={t2.path}
            className={`tab ${active === t2.id ? 'active' : ''}`}
            aria-current={active === t2.id ? 'page' : undefined}
          >
            <span className="tab-icon">{ICONS[t2.id]}</span>
            <span className="tab-label">{t(t2.key)}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
