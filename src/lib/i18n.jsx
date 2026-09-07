import { createContext, useContext, useEffect, useState } from 'react'

// Lightweight i18n: a language switch that actually works (persists, flips
// the document to RTL for Urdu/Arabic, and falls back to English for any
// key not yet translated so nothing ever shows blank). Full app-wide
// coverage across every one of the 16 languages the reference app ships is
// a large, ongoing content task — this wires up the real screens people
// hit constantly (nav, profile, home) in 4 languages as a working base to
// extend from, rather than translating every string in one pass.
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ur', label: 'اردو', dir: 'rtl' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'es', label: 'Español', dir: 'ltr' }
]

const STRINGS = {
  en: {
    nav_home: 'Home', nav_workout: 'Workout', nav_exercises: 'Exercises', nav_progress: 'Progress', nav_profile: 'Profile',
    profile_goal: 'Goal', profile_level: 'Level', profile_current_weight: 'Current weight',
    profile_training_frequency: 'Training frequency', profile_total_workouts: 'Total workouts', profile_total_volume: 'Total volume',
    profile_favorites: 'Favorites', profile_muscle_map: 'Muscle map', profile_ai_coach: 'AI Coach',
    profile_subscription: 'Subscription', profile_notifications: 'Notifications', profile_language: 'Language',
    profile_sign_out: 'Sign out', profile_email: 'Email', profile_athlete: 'Athlete'
  },
  ur: {
    nav_home: 'ہوم', nav_workout: 'ورک آؤٹ', nav_exercises: 'ورزشیں', nav_progress: 'پیش رفت', nav_profile: 'پروفائل',
    profile_goal: 'مقصد', profile_level: 'سطح', profile_current_weight: 'موجودہ وزن',
    profile_training_frequency: 'ٹریننگ کے دن', profile_total_workouts: 'کل ورک آؤٹس', profile_total_volume: 'کل حجم',
    profile_favorites: 'پسندیدہ', profile_muscle_map: 'مسل میپ', profile_ai_coach: 'اے آئی کوچ',
    profile_subscription: 'سبسکرپشن', profile_notifications: 'اطلاعات', profile_language: 'زبان',
    profile_sign_out: 'سائن آؤٹ', profile_email: 'ای میل', profile_athlete: 'ایتھلیٹ'
  },
  ar: {
    nav_home: 'الرئيسية', nav_workout: 'التمرين', nav_exercises: 'التمارين', nav_progress: 'التقدم', nav_profile: 'الملف الشخصي',
    profile_goal: 'الهدف', profile_level: 'المستوى', profile_current_weight: 'الوزن الحالي',
    profile_training_frequency: 'أيام التدريب', profile_total_workouts: 'إجمالي التمارين', profile_total_volume: 'إجمالي الحجم',
    profile_favorites: 'المفضلة', profile_muscle_map: 'خريطة العضلات', profile_ai_coach: 'المدرب الذكي',
    profile_subscription: 'الاشتراك', profile_notifications: 'الإشعارات', profile_language: 'اللغة',
    profile_sign_out: 'تسجيل الخروج', profile_email: 'البريد الإلكتروني', profile_athlete: 'رياضي'
  },
  es: {
    nav_home: 'Inicio', nav_workout: 'Entreno', nav_exercises: 'Ejercicios', nav_progress: 'Progreso', nav_profile: 'Perfil',
    profile_goal: 'Objetivo', profile_level: 'Nivel', profile_current_weight: 'Peso actual',
    profile_training_frequency: 'Frecuencia de entreno', profile_total_workouts: 'Entrenos totales', profile_total_volume: 'Volumen total',
    profile_favorites: 'Favoritos', profile_muscle_map: 'Mapa muscular', profile_ai_coach: 'Entrenador IA',
    profile_subscription: 'Suscripción', profile_notifications: 'Notificaciones', profile_language: 'Idioma',
    profile_sign_out: 'Cerrar sesión', profile_email: 'Correo', profile_athlete: 'Atleta'
  }
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('forgefit_lang') || 'en' } catch { return 'en' }
  })

  useEffect(() => {
    const meta = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0]
    document.documentElement.lang = lang
    document.documentElement.dir = meta.dir
  }, [lang])

  function setLanguage(code) {
    try { localStorage.setItem('forgefit_lang', code) } catch { /* private browsing, etc. */ }
    setLangState(code)
  }

  function t(key) {
    return STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
