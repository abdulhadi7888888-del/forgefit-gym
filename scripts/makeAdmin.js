// Usage: node scripts/makeAdmin.js <uid>
// Requires scripts/serviceAccountKey.json (see scripts/seedExercises.js for how to get one).
import admin from 'firebase-admin'
import { readFileSync } from 'fs'

const uid = process.argv[2]
if (!uid) {
  console.error('Usage: node scripts/makeAdmin.js <uid>')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)))
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

async function run() {
  await db.doc(`admins/${uid}`).set({
    role: 'admin',
    grantedAt: admin.firestore.FieldValue.serverTimestamp(),
    grantedBy: 'script'
  })
  await db.doc(`users/${uid}`).set({ role: 'admin' }, { merge: true })
  console.log(`Granted admin to ${uid}`)
}

run().catch(console.error)
