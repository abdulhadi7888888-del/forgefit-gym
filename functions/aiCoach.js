import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'

const db = getFirestore()
const ANTHROPIC_API_KEY = defineSecret('ANTHROPIC_API_KEY')

/**
 * Callable from the client. Pulls the user's real profile, active plan,
 * recent sessions, and PRs from Firestore, then sends that context plus the
 * user's question to an LLM. The model never sees other users' data, and it
 * is explicitly instructed not to give medical diagnoses.
 *
 * Set the secret once: firebase functions:secrets:set ANTHROPIC_API_KEY
 */
export const askCoach = onCall({ secrets: [ANTHROPIC_API_KEY] }, async (request) => {
  const uid = request.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Sign in required.')

  const question = (request.data?.question || '').trim()
  if (!question) throw new HttpsError('invalid-argument', 'question is required.')
  if (question.length > 1000) throw new HttpsError('invalid-argument', 'Question too long.')

  const context = await buildUserContext(uid)

  const systemPrompt = `You are an encouraging, knowledgeable strength-and-conditioning coach inside the
ForgeFit Gym app. Use the user's real training data below to answer their question specifically —
reference actual exercises, numbers, and patterns from their history rather than generic advice
when the data supports it. Keep answers concise and actionable (bullet points where useful).
Never provide medical diagnoses, and if the question describes pain, injury, or a medical symptom,
recommend seeing a doctor or physical therapist instead of prescribing a fix.

USER CONTEXT:
${JSON.stringify(context, null, 2)}`

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY.value(),
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }]
    })
  })

  if (!resp.ok) {
    const errText = await resp.text()
    console.error('LLM call failed', resp.status, errText)
    throw new HttpsError('internal', 'The coach is unavailable right now.')
  }

  const data = await resp.json()
  const answer = data.content?.find(b => b.type === 'text')?.text || "Sorry, I couldn't come up with an answer."

  await db.collection(`aiCoachLogs/${uid}/messages`).add({
    question, answer, createdAt: FieldValue.serverTimestamp()
  })

  return { answer }
})

async function buildUserContext(uid) {
  const [profileSnap, plansSnap, sessionsSnap, prsSnap] = await Promise.all([
    db.doc(`profiles/${uid}`).get(),
    db.collection(`workoutPlans/${uid}/plans`).where('isActive', '==', true).limit(1).get(),
    db.collection(`workoutSessions/${uid}/sessions`)
      .where('status', '==', 'completed').orderBy('startedAt', 'desc').limit(10).get(),
    db.collection(`personalRecords/${uid}/records`).get()
  ])

  return {
    profile: profileSnap.exists ? profileSnap.data() : null,
    activePlan: plansSnap.empty ? null : plansSnap.docs[0].data(),
    recentSessions: sessionsSnap.docs.map(d => {
      const s = d.data()
      return { dayName: s.dayName, totalVolume: s.totalVolume, totalSets: s.totalSets, feeling: s.feeling }
    }),
    personalRecords: prsSnap.docs.map(d => {
      const p = d.data()
      return { exercise: p.exerciseName, bestWeightKg: p.bestWeightKg, bestReps: p.bestReps }
    })
  }
}
