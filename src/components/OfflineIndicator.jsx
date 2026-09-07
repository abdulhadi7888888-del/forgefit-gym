import { useEffect, useState } from 'react'
import { watchOnlineStatus, waitForSync, watchPendingWrites } from '../lib/offline'

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [pending, setPending] = useState(0)

  useEffect(() => {
    const unwatch = watchOnlineStatus(async (isOnline) => {
      const wasOffline = !online
      setOnline(isOnline)
      if (isOnline && wasOffline) {
        setSyncing(true)
        try { await waitForSync() } finally { setSyncing(false) }
      }
    })
    return unwatch
  }, [online])

  useEffect(() => watchPendingWrites(setPending), [])

  if (online && !syncing && pending === 0) return null

  const label = !online
    ? pending > 0
      ? `You're offline — ${pending} change${pending === 1 ? '' : 's'} saved on this device, will sync automatically.`
      : "You're offline — sets are being saved on this device and will sync automatically."
    : syncing
      ? 'Syncing…'
      : `Syncing ${pending} pending change${pending === 1 ? '' : 's'}…`

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
      background: online ? 'var(--ok)' : 'var(--danger)', color: '#fff',
      textAlign: 'center', padding: '6px 10px', fontSize: 12, fontWeight: 800
    }}>
      {label}
    </div>
  )
}
