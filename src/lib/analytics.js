import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

// Every call site passes only non-identifying event data (no email, name, etc.)
// — Firebase Analytics already ties events to a pseudonymous client ID, so
// personal fields don't need to be attached here.
export function track(eventName, params = {}) {
  if (!analytics) return // unsupported browser, or measurementId not configured
  try {
    logEvent(analytics, eventName, params)
  } catch (err) {
    console.warn('Analytics event failed', eventName, err)
  }
}
