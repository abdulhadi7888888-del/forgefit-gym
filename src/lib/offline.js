// Firestore's SDK already caches reads and queues writes offline by default
// (enableIndexedDbPersistence below), which covers most of section 27 for free.
// This module adds the one thing that needs explicit handling: giving the UI
// a reliable "you're offline" signal and a visible queue of writes that
// haven't reached the server yet, since Firestore's own queue is invisible
// to the app unless you listen for it.

import { enableIndexedDbPersistence, waitForPendingWrites } from 'firebase/firestore'
import { db } from './firebase'

const OFFLINE_PLAN_PREFIX = 'forgefit:plan:'

export function cachePlan(uid, plan) {
  if (!uid || !plan) return
  try { localStorage.setItem(`${OFFLINE_PLAN_PREFIX}${uid}`, JSON.stringify(plan)) } catch { /* optional cache */ }
}

export function readCachedPlan(uid) {
  if (!uid) return null
  try {
    const raw = localStorage.getItem(`${OFFLINE_PLAN_PREFIX}${uid}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

let persistenceEnabled = false

// --- Pending-write tracking -------------------------------------------------
// Firestore queues writes made while offline and flushes them once the
// connection returns, but it doesn't expose *how many* writes are still
// queued — the UI only gets a binary online/offline signal. This counter
// wraps any write so components (e.g. the offline banner) can show
// "3 changes pending" instead of just "offline".
let pendingCount = 0
const pendingListeners = new Set()

function notifyPending() {
  pendingListeners.forEach((cb) => cb(pendingCount))
}

export function watchPendingWrites(callback) {
  callback(pendingCount)
  pendingListeners.add(callback)
  return () => pendingListeners.delete(callback)
}

// Wrap any Firestore write (setDoc/updateDoc/addDoc/deleteDoc call) with this
// so it's counted while in flight. Works the same online or offline — online
// it resolves almost immediately, offline it stays pending until sync.
export async function trackedWrite(writePromiseFactory) {
  pendingCount += 1
  notifyPending()
  try {
    return await writePromiseFactory()
  } finally {
    pendingCount = Math.max(0, pendingCount - 1)
    notifyPending()
  }
}

// --- Conflict resolution -----------------------------------------------------
// Firestore's default behavior for two offline edits to the *same document*
// is "last write to reach the server wins" — whichever client's queued write
// lands last silently overwrites the other, even if it was made earlier in
// wall-clock time. That's fine for append-only data (sets, sessions) but not
// for a document a user might edit on two devices while both are offline
// (profile, body measurements). For those, stamp every local write with a
// client-side timestamp and resolve conflicts by comparing timestamps rather
// than server arrival order.
export function stampForWrite(data) {
  return { ...data, _updatedAtClient: Date.now() }
}

// Given the doc currently in Firestore and the local edit you're about to
// write, decide whether the local edit should proceed. Returns the local
// edit (stamped) if it's newer, or null if the remote version is newer and
// the write should be skipped (surface this to the user as "synced from
// another device" rather than silently discarding their edit).
export function resolveConflict(remoteData, localEdit) {
  const remoteStamp = remoteData?._updatedAtClient || 0
  const localStamp = Date.now()
  if (remoteStamp > localStamp) return null
  return { ...localEdit, _updatedAtClient: localStamp }
}

export async function enableOfflineSupport() {
  if (persistenceEnabled) return
  try {
    await enableIndexedDbPersistence(db)
    persistenceEnabled = true
  } catch (err) {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open — persistence can only be enabled in one at a time.
      console.warn('Offline persistence disabled: multiple tabs open.')
    } else if (err.code === 'unimplemented') {
      console.warn('Offline persistence not supported in this browser.')
    } else {
      console.error('Offline persistence failed to enable', err)
    }
  }
}

export function watchOnlineStatus(callback) {
  callback(navigator.onLine)
  const on = () => callback(true)
  const off = () => callback(false)
  window.addEventListener('online', on)
  window.addEventListener('offline', off)
  return () => {
    window.removeEventListener('online', on)
    window.removeEventListener('offline', off)
  }
}

// Resolves once every queued write has actually reached Firestore's servers.
// Call this after coming back online if you want to confirm sync completed
// (e.g. before showing a "synced" checkmark) rather than just trusting the
// SDK's silent background retry.
export async function waitForSync() {
  await waitForPendingWrites(db)
}
