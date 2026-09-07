import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminGetUserCount, adminGetExerciseCount } from '../../lib/adminData'

const actions = [
  { to: '/admin/exercises', label: 'Manage exercises', detail: 'Build and maintain the library', icon: '01' },
  { to: '/admin/users', label: 'Members', detail: 'Review member accounts', icon: '02' },
  { to: '/admin/notifications', label: 'Broadcast', detail: 'Send an announcement', icon: '03' },
  { to: '/admin/subscriptions', label: 'Subscriptions', detail: 'Activate member plans', icon: '04' }
]

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(null)
  const [exerciseCount, setExerciseCount] = useState(null)

  useEffect(() => {
    adminGetUserCount().then(setUserCount)
    adminGetExerciseCount().then(setExerciseCount)
  }, [])

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM <span className="muted" style={{ fontSize: 11, letterSpacing: 1 }}>ADMIN</span></div></header>
      <main>
        <div className="eyebrow">OPERATIONS / OVERVIEW</div>
        <h1>Run the<br /><span style={{ color: 'var(--accent)' }}>gym better.</span></h1>
        <div className="stats">
          <div className="stat"><span className="muted">Active members</span><b>{userCount ?? '—'}</b><small className="muted">all accounts</small></div>
          <div className="stat"><span className="muted">Exercise library</span><b>{exerciseCount ?? '—'}</b><small className="muted">movements</small></div>
          <div className="stat"><span className="muted">Member health</span><b style={{ color: 'var(--ok)' }}>Good</b><small className="muted">system status</small></div>
          <div className="stat"><span className="muted">Today</span><b>{new Date().toLocaleDateString('en-US', { day: '2-digit' })}</b><small className="muted">{new Date().toLocaleDateString('en-US', { month: 'short' })}</small></div>
        </div>
        <div className="card">
          <div className="row"><div><div className="eyebrow">QUICK ACTIONS</div><h2 style={{ margin: '6px 0 0' }}>Keep things moving.</h2></div><span className="muted">4 tools</span></div>
          <div style={{ marginTop: 18 }}>
            {actions.map(action => <Link key={action.to} to={action.to} className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '16px 0', borderBottom: '1px solid var(--line)' }}><span style={{ display: 'flex', alignItems: 'center', gap: 14 }}><b style={{ color: 'var(--accent)', fontSize: 12 }}>{action.icon}</b><span><b style={{ display: 'block' }}>{action.label}</b><small className="muted">{action.detail}</small></span></span><span style={{ color: 'var(--accent)', fontSize: 22 }}>→</span></Link>)}
          </div>
        </div>
        <p className="muted" style={{ fontSize: 13 }}>Live subscription and analytics reporting will appear here as member activity accumulates.</p>
      </main>
    </div>
  )
} 
