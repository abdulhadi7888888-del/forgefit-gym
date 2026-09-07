import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminGetRecentUsers } from '../../lib/adminData'

export default function AdminUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    adminGetRecentUsers(100).then(setUsers)
  }, [])

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM <span className="muted" style={{ fontSize: 12 }}>ADMIN</span></div></header>
      <main>
        <div className="eyebrow">ADMIN</div>
        <h1>Users</h1>
        <p className="muted">{users.length} most recent accounts</p>
        <div className="card">
          {users.map(u => (
            <div key={u.id} className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div>{u.displayName || u.email || 'Guest'}</div>
                <div className="muted" style={{ fontSize: 12 }}>{u.authProvider} • {u.isPremium ? 'Premium' : 'Free'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="muted">{u.role}</span>
                {u.email && (
                  <Link className="secondary" style={{ textDecoration: 'none', padding: '6px 10px', borderRadius: 8 }}
                    to={`/admin/subscriptions?email=${encodeURIComponent(u.email)}`}>
                    Grant plan
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
