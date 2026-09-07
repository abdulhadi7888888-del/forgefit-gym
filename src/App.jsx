import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import AdminGuard from './components/AdminGuard'
import OfflineIndicator from './components/OfflineIndicator'
import PremiumGuard from './components/PremiumGuard'

// Everything below is lazy-loaded: each page becomes its own JS chunk that
// only downloads when the user actually navigates there, instead of all
// pages (including the 5 admin-only ones almost nobody visits) being part
// of the one bundle every visitor downloads before the app can even render.
// Home stays eager since it's what most sessions open to first.
const Exercises = lazy(() => import('./pages/Exercises'))
const ExerciseDetail = lazy(() => import('./pages/ExerciseDetail'))
const Workout = lazy(() => import('./pages/Workout'))
const Progress = lazy(() => import('./pages/Progress'))
const Profile = lazy(() => import('./pages/Profile'))
const WorkoutBuilder = lazy(() => import('./pages/WorkoutBuilder'))
const CustomExercise = lazy(() => import('./pages/CustomExercise'))
const History = lazy(() => import('./pages/History'))
const Cardio = lazy(() => import('./pages/Cardio'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Measurements = lazy(() => import('./pages/Measurements'))
const WorkoutGenerator = lazy(() => import('./pages/WorkoutGenerator'))
const MuscleMap = lazy(() => import('./pages/MuscleMap'))
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'))
const AICoach = lazy(() => import('./pages/AICoach'))
const Subscription = lazy(() => import('./pages/Subscription'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminExercises = lazy(() => import('./pages/admin/AdminExercises'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'))
const AdminActivateSubscription = lazy(() => import('./pages/admin/AdminActivateSubscription'))

function PageFallback() {
  return <div className="app"><main><p className="muted">Loading…</p></main></div>
}

export default function App() {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="app"><main><p className="muted">Loading…</p></main></div>
  if (!user) return <Login />
  if (!profile || !profile.onboardingComplete) return <Onboarding />

  return (
    <>
      <OfflineIndicator />
      <Suspense fallback={<PageFallback />}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/exercises/:slug" element={<ExerciseDetail />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/workout-builder" element={<WorkoutBuilder />} />
        <Route path="/custom-exercise" element={<CustomExercise />} />
        <Route path="/history" element={<History />} />
        <Route path="/cardio" element={<Cardio />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/measurements" element={<Measurements />} />
        <Route path="/workout-generator" element={<WorkoutGenerator />} />
        <Route path="/muscle-map" element={<MuscleMap />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
        <Route path="/coach" element={<PremiumGuard><AICoach /></PremiumGuard>} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/exercises" element={<AdminGuard><AdminExercises /></AdminGuard>} />
        <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
        <Route path="/admin/notifications" element={<AdminGuard><AdminNotifications /></AdminGuard>} />
        <Route path="/admin/subscriptions" element={<AdminGuard><AdminActivateSubscription /></AdminGuard>} />

        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </>
  )
}
