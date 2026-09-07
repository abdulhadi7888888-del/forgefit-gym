import {
  doc, setDoc, addDoc, updateDoc, getDoc, getDocs, collection,
  query, where, orderBy, serverTimestamp, increment
} from 'firebase/firestore'
import { db } from './firebase'

export async function saveOnboarding(uid, data) {
  await setDoc(doc(db, 'profiles', uid), { ...data, onboardingComplete: true }, { merge: true })
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, 'profiles', uid))
  return snap.exists() ? snap.data() : null
}

export async function savePlan(uid, plan) {
  const ref = await addDoc(collection(db, 'workoutPlans', uid, 'plans'), {
    ...plan,
    createdAt: serverTimestamp(),
    isActive: true
  })
  return ref.id
}

export async function getActivePlan(uid) {
  const q = query(collection(db, 'workoutPlans', uid, 'plans'), where('isActive', '==', true))
  const snap = await getDocs(q)
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
}

export async function startSession(uid, dayName, planId) {
  const ref = await addDoc(collection(db, 'workoutSessions', uid, 'sessions'), {
    planId: planId || null,
    dayName,
    startedAt: serverTimestamp(),
    finishedAt: null,
    durationSeconds: 0,
    status: 'in_progress',
    totalVolume: 0,
    totalSets: 0,
    notes: ''
  })
  return ref.id
}

export async function logSet(uid, sessionId, { exerciseId, exerciseName, setNumber, weightKg, reps }) {
  const volume = weightKg * reps
  const dateKey = new Date().toISOString().slice(0, 10)
  await addDoc(collection(db, 'exerciseLogs', uid, 'logs'), {
    sessionId, exerciseId, exerciseName, setNumber, weightKg, reps, volume,
    date: dateKey, timestamp: serverTimestamp()
  })
  await updateDoc(doc(db, 'workoutSessions', uid, 'sessions', sessionId), {
    totalVolume: increment(volume),
    totalSets: increment(1)
  })
  await maybeSetPR(uid, exerciseId, exerciseName, weightKg, reps)
}

async function maybeSetPR(uid, exerciseId, exerciseName, weightKg, reps) {
  const ref = doc(db, 'personalRecords', uid, 'records', exerciseId)
  const snap = await getDoc(ref)
  const prevBest = snap.exists() ? snap.data().bestWeightKg : 0
  if (weightKg > prevBest) {
    const estimated1RM = weightKg * (1 + reps / 30)
    await setDoc(ref, {
      exerciseName, bestWeightKg: weightKg, bestReps: reps,
      estimated1RM, achievedAt: serverTimestamp(), previousBestKg: prevBest
    })
    return true
  }
  return false
}

export async function finishSession(uid, sessionId, feeling, notes) {
  await updateDoc(doc(db, 'workoutSessions', uid, 'sessions', sessionId), {
    status: 'completed',
    finishedAt: serverTimestamp(),
    feeling: feeling || null,
    notes: notes || ''
  })
}

export async function getRecentSessions(uid, max = 20) {
  const q = query(
    collection(db, 'workoutSessions', uid, 'sessions'),
    where('status', '==', 'completed'),
    orderBy('startedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.slice(0, max).map(d => ({ id: d.id, ...d.data() }))
}

export async function getLogsSince(uid, sinceDateKey) {
  const q = query(
    collection(db, 'exerciseLogs', uid, 'logs'),
    where('date', '>=', sinceDateKey),
    orderBy('date', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getAllPRs(uid) {
  const snap = await getDocs(collection(db, 'personalRecords', uid, 'records'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getRecentExerciseLogs(uid, exerciseId, max = 20) {
  const q = query(
    collection(db, 'exerciseLogs', uid, 'logs'),
    where('exerciseId', '==', exerciseId)
  )
  const snap = await getDocs(q)
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0))
    .slice(0, max)
}

export async function addBodyWeight(uid, weightKg) {
  const dateKey = new Date().toISOString().slice(0, 10)
  await addDoc(collection(db, 'bodyWeight', uid, 'entries'), {
    date: dateKey, weightKg, timestamp: serverTimestamp()
  })
  await setDoc(doc(db, 'profiles', uid), { currentWeightKg: weightKg }, { merge: true })
}

export async function getBodyWeightHistory(uid) {
  const q = query(collection(db, 'bodyWeight', uid, 'entries'), orderBy('date', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
