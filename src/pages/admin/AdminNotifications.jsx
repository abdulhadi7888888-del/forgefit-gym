import { useState } from 'react'
import { adminGetRecentUsers, adminBroadcastNotification } from '../../lib/adminData'

export default function AdminNotifications() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('')

  async function send() {
    if (!title || !body) return
    setStatus('Sending…')
    const users = await adminGetRecentUsers(1000)
    await adminBroadcastNotification(users.map(u => u.id), { title, body })
    setStatus(`Sent to ${users.length} users.`)
    setTitle(''); setBody('')
  }

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM <span className="muted" style={{ fontSize: 12 }}>ADMIN</span></div></header>
      <main>
        <div className="eyebrow">ADMIN</div>
        <h1>Send notification</h1>
        <div className="card">
          <div className="field"><label>Title</label>
            <input className="search" value={title} onChange={e => setTitle(e.target.value)} /></div>
          <div className="field"><label>Body</label>
            <input className="search" value={body} onChange={e => setBody(e.target.value)} /></div>
          <button className="primary" onClick={send}>BROADCAST TO ALL USERS</button>
          {status && <p className="muted">{status}</p>}
        </div>
        <p className="muted">
          This writes an in-app notification doc for every user (visible in their notification list).
          It does not push to their lock screen — that needs FCM device tokens wired up server-side.
        </p>
      </main>
    </div>
  )
}
