import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { isUserAdmin } from '../lib/adminData'

export default function AdminGuard({ children }) {
  const { user } = useAuth()
  const [status, setStatus] = useState('checking') // checking | allowed | denied

  useEffect(() => {
    let active = true
    isUserAdmin(user.uid).then(ok => { if (active) setStatus(ok ? 'allowed' : 'denied') })
    return () => { active = false }
  }, [user])

  if (status === 'checking') return <div className="app"><main><p className="muted">Checking access…</p></main></div>
  if (status === 'denied') {
    return (
      <div className="app">
        <main>
          <div className="eyebrow">ADMIN</div>
          <h1>Not authorized</h1>
          <p className="muted">
            Your account isn't listed in <code>/admins</code>. An existing admin needs to add your
            uid there (Firebase Console, or a one-off script) — this can't be granted from the app itself.
          </p>
        </main>
      </div>
    )
  }
  return children
}
