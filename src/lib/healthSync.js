// HealthKit (iOS) / Health Connect (Android) sync bridge.
//
// This is a *web app running in a browser* in this sandbox, so there is no
// HealthKit or Health Connect to talk to — those are native OS frameworks
// with no browser API. This module is the real integration point for when
// the app is wrapped with Capacitor (see README "Native iOS / Android"):
// once wrapped, install a Capacitor health plugin (e.g.
// `@perfood/capacitor-healthkit` for iOS, `capacitor-health-connect` for
// Android) and this file becomes a drop-in — nothing else in the app needs
// to change, because Cardio.jsx and the dashboard only ever call the
// functions below, never a plugin directly.
//
// On web (or if no plugin is installed), everything here safely no-ops so
// manual cardio logging keeps working exactly as it does today.

import { Capacitor } from '@capacitor/core'
import { logCardio } from './customData'

function getPlugin() {
  // Registered lazily so this file doesn't hard-crash on web, where
  // @capacitor/core exists but the platform-specific health plugins don't.
  if (!Capacitor?.isNativePlatform?.()) return null
  const plugins = Capacitor.Plugins || {}
  return plugins.HealthKit || plugins.HealthConnect || null
}

export function isHealthSyncAvailable() {
  return !!getPlugin()
}

export function currentHealthPlatform() {
  if (!Capacitor?.isNativePlatform?.()) return 'web'
  return Capacitor.getPlatform() // 'ios' | 'android'
}

// Requests read access to workouts/steps/heart-rate/distance. Must be called
// from a user gesture (e.g. a "Connect Apple Health" button tap), per both
// platforms' permission-prompt rules.
export async function requestHealthPermissions() {
  const plugin = getPlugin()
  if (!plugin) return { granted: false, reason: 'no-native-plugin' }

  try {
    const permissions = currentHealthPlatform() === 'ios'
      ? ['workouts', 'steps', 'distance', 'heartRate', 'activeEnergyBurned']
      : ['ExerciseSession', 'Steps', 'Distance', 'HeartRate', 'TotalCaloriesBurned']
    await plugin.requestAuthorization({ read: permissions })
    return { granted: true }
  } catch (err) {
    console.warn('Health permission request failed', err)
    return { granted: false, reason: err.message }
  }
}

// Pulls workouts recorded natively (e.g. an Apple Watch run) since `sinceDate`
// and writes any ForgeFit doesn't already have into cardioLogs, tagged with
// their source device id so re-syncing never double-imports the same entry.
export async function syncHealthWorkouts(uid, { sinceDate, existingSourceIds = new Set() } = {}) {
  const plugin = getPlugin()
  if (!plugin) return { synced: 0, available: false }

  const since = sinceDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  let workouts = []
  try {
    const result = await plugin.queryWorkouts({ startDate: since.toISOString(), endDate: new Date().toISOString() })
    workouts = result?.workouts || []
  } catch (err) {
    console.warn('Health workout query failed', err)
    return { synced: 0, available: true, error: err.message }
  }

  let synced = 0
  for (const w of workouts) {
    const sourceId = w.uuid || w.id
    if (!sourceId || existingSourceIds.has(sourceId)) continue // already imported

    await logCardio(uid, {
      type: mapWorkoutType(w.workoutActivityType || w.exerciseType),
      durationMin: Math.round((w.duration || 0) / 60),
      distanceKm: w.totalDistance ? Number((w.totalDistance / 1000).toFixed(2)) : null,
      caloriesEstimate: w.totalEnergyBurned ? Math.round(w.totalEnergyBurned) : null,
      heartRateAvg: w.averageHeartRate || null,
      source: currentHealthPlatform(),
      sourceId
    })
    existingSourceIds.add(sourceId)
    synced += 1
  }

  return { synced, available: true }
}

function mapWorkoutType(nativeType) {
  const map = {
    running: 'Running', walking: 'Walking', cycling: 'Cycling',
    elliptical: 'Elliptical', rowing: 'Rowing', stairClimbing: 'Stair Climber',
    swimming: 'Swimming', traditionalStrengthTraining: 'Strength'
  }
  const key = String(nativeType || '').toLowerCase()
  return Object.entries(map).find(([k]) => key.includes(k.toLowerCase()))?.[1] || 'Other'
}
