import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminGetUserCount, adminGetExerciseCount } from '../../lib/adminData'

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(null)
  const [exerciseCount, setExerciseCount] = useState(null)

  useEffect(() => {
    // Both of these are server-side aggregation counts now (getCountFromServer),
    // not full collection downloads — this is what made every admin dashboard
    // open slow before (it was pulling every user doc and every exercise doc
    // just to show two numbers).
    adminGetUserCount().then(setUserCount)
    adminGetExerciseCount().then(setExerciseCount)
  }, [])

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM <span className="muted" style={{ fontSize: 12 }}>ADMIN</span></div></header>
      <main>
        <div className="eyebrow">ADMIN</div>
        <h1>Dashboard</h1>

        <div className="stats">
          <div className="stat"><span className="muted">Users</span><b>{userCount ?? '…'}</b></div>
          <div className="stat"><span className="muted">Exercises</span><b>{exerciseCount ?? '…'}</b></div>
        </div>

        <div className="card">
          <Link to="/admin/exercises" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>Manage exercises</span><span>›</span></Link>
          <Link to="/admin/users" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>Users</span><span>›</span></Link>
          <Link to="/admin/notifications" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span>Send notification</span><span>›</span></Link>
          <Link to="/admin/subscriptions" className="row" style={{ textDecoration: 'none', color: 'inherit', padding: '10px 0' }}>
            <span>Activate subscription</span><span>›</span></Link>
        </div>

        <p className="muted">
          Subscription and analytics dashboards need real payment/analytics data flowing first —
          those tabs light up once purchases and events start recording.
        </p>
      </main>
    </div>
  )
}
