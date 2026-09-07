import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { registerForPushNotifications } from '../lib/push'

const TYPES = [
  { id: 'workoutReminder', label: 'Workout reminder' },
  { id: 'restTimerAlert', label: 'Rest timer alert' },
  { id: 'streak', label: 'Streak updates' },
  { id: 'prAchieved', label: 'PR achieved' },
  { id: 'weeklyProgress', label: 'Weekly progress summary' },
  { id: 'goalReminder', label: 'Goal reminder' },
  { id: 'missedWorkout', label: 'Missed workout reminder' }
]

export default function NotificationSettings() {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState({})
  const [pushStatus, setPushStatus] = useState('idle') // idle | asking | enabled | denied | unsupported

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'notificationPrefs', user.uid))
      setPrefs(snap.exists() ? snap.data() : Object.fromEntries(TYPES.map(t => [t.id, true])))
    }
    if (user) load()
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') setPushStatus('enabled')
  }, [user])

  async function toggle(id) {
    const next = { ...prefs, [id]: !prefs[id] }
    setPrefs(next)
    await setDoc(doc(db, 'notificationPrefs', user.uid), next, { merge: true })
  }

  async function enablePush() {
    setPushStatus('asking')
    const result = await registerForPushNotifications(user.uid)
    setPushStatus(result.ok ? 'enabled' : result.reason)
  }

  return (
    <div className="app">
      <header><div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><img src="/icon-192.png" alt="ForgeFit Gym logo" width="28" height="28" style={{ borderRadius: 8 }} />FORGE<span>FIT</span> GYM</div></header>
      <main>
        <div className="eyebrow">SETTINGS</div>
        <h1>Notifications</h1>

        <div className="card">
          {pushStatus === 'enabled'
            ? <p>Push notifications enabled on this device</p>
            : (
              <>
                <p className="muted">Enable push to get PR alerts and reminders even when the app is closed.</p>
                <button className="primary" onClick={enablePush} disabled={pushStatus === 'asking'}>
                  {pushStatus === 'asking' ? 'Requesting…' : 'ENABLE PUSH NOTIFICATIONS'}
                </button>
                {pushStatus === 'denied' && <p className="error">Permission denied — enable notifications for this site in your browser settings.</p>}
                {pushStatus === 'unsupported' && <p className="muted">Push isn't supported in this browser.</p>}
              </>
            )}
        </div>

        <div className="card">
          {TYPES.map(t => (
            <div key={t.id} className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <span>{t.label}</span>
              <button className="secondary" onClick={() => toggle(t.id)}>
                {prefs[t.id] ? 'ON' : 'OFF'}
              </button>
            </div>
          ))}
        </div>
        <p className="muted">
          These toggles are checked server-side (onPersonalRecord, missedWorkoutCheck Cloud Functions)
          before a notification is created or pushed.
        </p>
      </main>
    </div>
  )
}
