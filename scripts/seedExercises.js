// Run once against your Firebase project to populate the public /exercises collection.
// Usage: node scripts/seedExercises.js
// Requires a service account key (Firebase Console -> Project Settings -> Service Accounts)
// saved as scripts/serviceAccountKey.json (keep this file OUT of git).

import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { exercises } from '../src/data/exercises.js'

const serviceAccount = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)))

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

async function seed() {
  const batch = db.batch()
  exercises.forEach((ex) => {
    const ref = db.collection('exercises').doc(ex.slug)
    batch.set(ref, { ...ex, updatedAt: admin.firestore.FieldValue.serverTimestamp() })
  })
  await batch.commit()
  console.log(`Seeded ${exercises.length} exercises.`)
}

seed().catch(console.error)
