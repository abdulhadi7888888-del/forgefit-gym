import {
  addDoc, getDocs, collection, query, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// ---------- body measurements (chest, waist, arms, thighs, shoulders, body fat) ----------
export async function addMeasurement(uid, entry) {
  const dateKey = new Date().toISOString().slice(0, 10)
  await addDoc(collection(db, 'measurements', uid, 'entries'), {
    date: dateKey,
    chestCm: entry.chestCm || null,
    waistCm: entry.waistCm || null,
    armsCm: entry.armsCm || null,
    thighsCm: entry.thighsCm || null,
    shouldersCm: entry.shouldersCm || null,
    bodyFatPct: entry.bodyFatPct || null,
    timestamp: serverTimestamp()
  })
}

export async function getMeasurementHistory(uid) {
  const q = query(collection(db, 'measurements', uid, 'entries'), orderBy('date', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
