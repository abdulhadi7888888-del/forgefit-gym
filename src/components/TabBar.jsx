import { Link } from 'react-router-dom'

const TABS = [
  { id: 'home', label: 'HOME', icon: '⌂', path: '/' },
  { id: 'workout', label: 'WORKOUT', icon: '▣', path: '/workout-builder' },
  { id: 'exercises', label: 'EXERCISES', icon: '◉', path: '/exercises' },
  { id: 'progress', label: 'PROGRESS', icon: '◒', path: '/progress' },
  { id: 'profile', label: 'PROFILE', icon: '○', path: '/profile' }
]

export default function TabBar({ active }) {
  return (
    <nav className="tabs">
      <div className="tabs-inner">
        {TABS.map(t => (
          <Link key={t.id} to={t.path} className={`tab ${active === t.id ? 'active' : ''}`} aria-current={active === t.id ? 'page' : undefined}>
            {t.icon}<br />{t.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
