import { useEffect, useRef, useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { app, db } from '../lib/firebase'
import TabBar from '../components/TabBar'

const SUGGESTIONS = [
  'What should I train today?',
  'How can I improve my bench press?',
  'Create a 4-day muscle building plan',
  'What should I do instead of barbell squat?'
]

export default function AICoach() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => { loadHistory() }, [user])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadHistory() {
    const q = query(collection(db, 'aiCoachLogs', user.uid, 'messages'), orderBy('createdAt', 'asc'))
    const snap = await getDocs(q)
    setMessages(snap.docs.map(d => d.data()).flatMap(m => ([
      { role: 'user', text: m.question },
      { role: 'coach', text: m.answer }
    ])))
  }

  async function send(question) {
    const q = (question ?? input).trim()
    if (!q || busy) return
    setError('')
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setBusy(true)
    try {
      const askCoach = httpsCallable(getFunctions(app), 'askCoach')
      const res = await askCoach({ question: q })
      setMessages(m => [...m, { role: 'coach', text: res.data.answer }])
    } catch (err) {
      setError(err.message || 'The coach is unavailable right now.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">AI COACH</div>
        <h1>Ask your coach</h1>
        <p className="muted">Uses your real profile, plan, and training history to answer — not general fitness trivia.</p>

        {messages.length === 0 && (
          <div className="chips" style={{ flexWrap: 'wrap' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <div className="card" style={{ minHeight: 200 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              margin: '10px 0', padding: 12, borderRadius: 14,
              background: m.role === 'user' ? 'var(--card2)' : 'transparent',
              border: m.role === 'coach' ? '1px solid var(--line)' : 'none'
            }}>
              <div className="eyebrow" style={{ marginBottom: 4 }}>{m.role === 'user' ? 'YOU' : 'COACH'}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          ))}
          {busy && <p className="muted">Thinking…</p>}
          {error && <p className="error">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <div className="row">
          <input className="search" style={{ width: '78%' }} value={input}
            placeholder="Ask anything about your training…"
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()} />
          <button className="primary" style={{ width: '20%', marginTop: 0 }} onClick={() => send()} disabled={busy}>SEND</button>
        </div>
      </main>
      <TabBar active="profile" />
    </div>
  )
}
