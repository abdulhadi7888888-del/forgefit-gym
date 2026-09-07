import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../lib/firebase'
import { getRecentSessions } from '../lib/data'
import { isUserAdmin } from '../lib/adminData'
import TabBar from '../components/TabBar'

export default function Profile() {
  const { user, profile } = useAuth()
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [totalVolume, setTotalVolume] = useState(0)
  const [admin, setAdmin] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const sessions = await getRecentSessions(user.uid, 1000)
        setTotalWorkouts(sessions.length)
        setTotalVolume(sessions.reduce((s, x) => s + (x.totalVolume || 0), 0))
        setAdmin(await isUserAdmin(user.uid))
      } catch (err) {
        console.error('Profile stats failed to load:', err)
      }
    }
    if (user) load()
  }, [user])

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">PROFILE</div>
        <h1>{profile?.name || 'Athlete'}</h1>

        <div className="card">
          <div className="row"><span className="muted">Goal</span><span>{profile?.primaryGoal || '—'}</span></div>
          <div className="row" style={{ marginTop: 8 }}><span className="muted">Level</span><span>{profile?.fitnessLevel || '—'}</span></div>
          <div className="row" style={{ marginTop: 8 }}><span className="muted">Current weight</span><span>{profile?.currentWeightKg || '—'} kg</span></div>
          <div className="row" style={{ marginTop: 8 }}><span className="muted">Training frequency</span><span>{profile?.trainingFrequency} days/week</span></div>
        </div>

        <div className="stats">
          <div className="stat"><span className="muted">Total workouts</span><b>{totalWorkouts}</b></div>
          <div className="stat"><span className="muted">Total volume</span><b>{Math.round(totalVolume).toLocaleString()}</b><small className="muted">kg</small></div>
        </div>

        <div className="card">
          <div className="row"><span>Email</span><span className="muted">{user.email || 'Guest account'}</span></div>
        </div>

        <div className="card">
          <Link to="/favorites" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>Favorites</span><span>›</span></Link>
          <Link to="/muscle-map" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>Muscle map</span><span>›</span></Link>
          <Link to="/coach" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>AI Coach</span><span>›</span></Link>
          <Link to="/subscription" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>Subscription</span><span>›</span></Link>
          <Link to="/settings/notifications" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0' }}>
            <span>Notifications</span><span>›</span></Link>
        </div>

        {admin && (
          <div className="card">
            <Link to="/admin" className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span>Admin panel <span className="muted" style={{ fontSize: 12 }}>(all features free)</span></span><span>›</span></Link>
          </div>
        )}

        <button className="secondary" style={{ width: '100%' }} onClick={() => signOut()}>SIGN OUT</button>
      </main>
      <TabBar active="profile" />
    </div>
  )
}
