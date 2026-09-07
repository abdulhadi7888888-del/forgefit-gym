import {
  doc, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, collection,
  query, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// ---------- custom exercises ----------
export async function addCustomExercise(uid, exercise) {
  const ref = await addDoc(collection(db, 'customExercises', uid, 'items'), {
    ...exercise,
    createdBy: uid,
    updatedAt: serverTimestamp()
  })
  return ref.id
}

export async function getCustomExercises(uid) {
  const snap = await getDocs(collection(db, 'customExercises', uid, 'items'))
  return snap.docs.map(d => ({ id: d.id, slug: d.id, ...d.data() }))
}

export async function deleteCustomExercise(uid, exerciseId) {
  await deleteDoc(doc(db, 'customExercises', uid, 'items', exerciseId))
}

// ---------- custom workout plans (builder) ----------
export async function createCustomPlan(uid, plan) {
  const ref = await addDoc(collection(db, 'workoutPlans', uid, 'plans'), {
    ...plan,
    isActive: false,
    isCustom: true,
    createdAt: serverTimestamp()
  })
  return ref.id
}

export async function getAllPlans(uid) {
  const q = query(collection(db, 'workoutPlans', uid, 'plans'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updatePlan(uid, planId, patch) {
  await updateDoc(doc(db, 'workoutPlans', uid, 'plans', planId), patch)
}

export async function deletePlan(uid, planId) {
  await deleteDoc(doc(db, 'workoutPlans', uid, 'plans', planId))
}

export async function setActivePlan(uid, planId, allPlanIds) {
  await Promise.all(
    allPlanIds.map(id => updateDoc(doc(db, 'workoutPlans', uid, 'plans', id), { isActive: id === planId }))
  )
}

export async function duplicatePlan(uid, plan) {
  const { id, ...rest } = plan
  return createCustomPlan(uid, { ...rest, name: `${plan.name} (copy)` })
}

// ---------- favorites ----------
export async function toggleFavorite(uid, type, refId, currentlyFav, favId) {
  if (currentlyFav && favId) {
    await deleteDoc(doc(db, 'favorites', uid, 'items', favId))
    return null
  }
  const ref = await addDoc(collection(db, 'favorites', uid, 'items'), {
    type, refId, addedAt: serverTimestamp()
  })
  return ref.id
}

export async function getFavorites(uid) {
  const snap = await getDocs(collection(db, 'favorites', uid, 'items'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ---------- cardio ----------
export async function logCardio(uid, entry) {
  const dateKey = new Date().toISOString().slice(0, 10)
  await addDoc(collection(db, 'cardioLogs', uid, 'entries'), {
    ...entry, date: dateKey, timestamp: serverTimestamp()
  })
}

export async function getCardioHistory(uid) {
  const q = query(collection(db, 'cardioLogs', uid, 'entries'), orderBy('timestamp', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
