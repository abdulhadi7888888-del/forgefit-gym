import {
  doc, setDoc, deleteDoc, getDoc, getDocs, collection, addDoc,
  query, where, orderBy, limit as fsLimit, serverTimestamp, getCountFromServer
} from 'firebase/firestore'
import { db } from './firebase'

export async function isUserAdmin(uid) {
  const snap = await getDoc(doc(db, 'admins', uid))
  return snap.exists()
}

// ---------- exercise library (admin-writable) ----------
export async function adminSaveExercise(exercise) {
  const slug = exercise.slug || exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  await setDoc(doc(db, 'exercises', slug), {
    ...exercise, slug, createdBy: 'system', updatedAt: serverTimestamp()
  }, { merge: true })
  return slug
}

export async function adminDeleteExercise(slug) {
  await deleteDoc(doc(db, 'exercises', slug))
}

export async function adminGetAllExercises() {
  const snap = await getDocs(collection(db, 'exercises'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Aggregation count — asks Firestore for just the number of matching docs
// without downloading any of them. Use this anywhere you only need a count
// (dashboard tiles); use adminGetAllExercises only on the actual management
// page where you need the full list to edit.
export async function adminGetExerciseCount() {
  const snap = await getCountFromServer(collection(db, 'exercises'))
  return snap.data().count
}

// ---------- users ----------
export async function adminGetRecentUsers(max = 50) {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), fsLimit(max))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function adminGetUserCount() {
  // Was: getDocs(collection(db,'users')).size — downloaded every single user
  // document just to count them, on every admin dashboard open. This asks
  // Firestore for the count server-side instead: one small aggregation
  // read, no document downloads, no matter how many users exist.
  const snap = await getCountFromServer(collection(db, 'users'))
  return snap.data().count
}

// Exact-match lookup by email — used to grant plan access by Gmail/email
// without downloading the whole user list. Queries `emailLower`, which
// AuthContext writes/backfills on every sign-in, so casing from any
// provider (Google, Apple, email/password) matches consistently.
export async function adminFindUserByEmail(email) {
  const q = query(collection(db, 'users'), where('emailLower', '==', email.toLowerCase().trim()), fsLimit(5))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ---------- broadcast notification ----------
// Writes one notification doc per user. Fine for small/medium user bases;
// for large scale, move this into a Cloud Function batched job instead.
export async function adminBroadcastNotification(userIds, { title, body, type = 'weekly_summary' }) {
  await Promise.all(
    userIds.map(uid =>
      addDoc(collection(db, 'notifications', uid, 'items'), {
        type, title, body, read: false, createdAt: serverTimestamp()
      })
    )
  )
}
