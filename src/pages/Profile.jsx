import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../lib/firebase'
import { getRecentSessions } from '../lib/data'
import { isUserAdmin } from '../lib/adminData'
import { useLanguage } from '../lib/i18n'
import TabBar from '../components/TabBar'

export default function Profile() {
  const { user, profile } = useAuth()
  const { t, lang, setLanguage, languages } = useLanguage()
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
        <div className="eyebrow">{t('nav_profile').toUpperCase()}</div>
        <h1>{profile?.name || t('profile_athlete')}</h1>

        <div className="card">
          <div className="row"><span className="muted">{t('profile_goal')}</span><span>{profile?.primaryGoal || '—'}</span></div>
          <div className="row" style={{ marginTop: 8 }}><span className="muted">{t('profile_level')}</span><span>{profile?.fitnessLevel || '—'}</span></div>
          <div className="row" style={{ marginTop: 8 }}><span className="muted">{t('profile_current_weight')}</span><span>{profile?.currentWeightKg || '—'} kg</span></div>
          <div className="row" style={{ marginTop: 8 }}><span className="muted">{t('profile_training_frequency')}</span><span>{profile?.trainingFrequency} days/week</span></div>
        </div>

        <div className="stats">
          <div className="stat"><span className="muted">{t('profile_total_workouts')}</span><b>{totalWorkouts}</b></div>
          <div className="stat"><span className="muted">{t('profile_total_volume')}</span><b>{Math.round(totalVolume).toLocaleString()}</b><small className="muted">kg</small></div>
        </div>

        <div className="card">
          <div className="row"><span>{t('profile_email')}</span><span className="muted">{user.email || 'Guest account'}</span></div>
        </div>

        <div className="card">
          <Link to="/favorites" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>{t('profile_favorites')}</span><span>›</span></Link>
          <Link to="/muscle-map" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>{t('profile_muscle_map')}</span><span>›</span></Link>
          <Link to="/coach" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>{t('profile_ai_coach')}</span><span>›</span></Link>
          <Link to="/subscription" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>{t('profile_subscription')}</span><span>›</span></Link>
          <Link to="/settings/notifications" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0' }}>
            <span>{t('profile_notifications')}</span><span>›</span></Link>
        </div>

        <div className="card">
          <div className="field">
            <label>{t('profile_language')}</label>
            <select className="search" value={lang} onChange={e => setLanguage(e.target.value)}>
              {languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
        </div>

        {admin && (
          <div className="card">
            <Link to="/admin" className="row" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span>Admin panel <span className="muted" style={{ fontSize: 12 }}>(all features free)</span></span><span>›</span></Link>
          </div>
        )}

        <button className="secondary" style={{ width: '100%' }} onClick={() => signOut()}>{t('profile_sign_out').toUpperCase()}</button>
      </main>
      <TabBar active="profile" />
    </div>
  )
}
