import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithEmail, signUpWithEmail, signInWithGoogle,
  signInWithApple, signInAsGuest, resetPassword, getAuthRedirectResult
} from '../lib/firebase'

export default function Login() {
  const [mode, setMode] = useState('login') // login | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    getAuthRedirectResult()
      .then((user) => { if (user) nav('/') })
      .catch((err) => setError(friendlyError(err.code)))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
      nav('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setBusy(false)
    }
  }

  async function handleProvider(fn) {
    setError('')
    setBusy(true)
    try {
      await fn()
      nav('/')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setBusy(false)
    }
  }

  async function handleReset() {
    if (!email) { setError('Enter your email above first.'); return }
    try {
      await resetPassword(email)
      setError('Password reset email sent.')
    } catch (err) {
      setError(friendlyError(err.code))
    }
  }

  return (
    <div className="app">
      <main>
        <div className="eyebrow">FORGEFIT</div>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input className="search" type="email" value={email} required
              onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="search" type="password" value={password} required minLength={6}
              onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={busy} type="submit">
            {busy ? 'Please wait…' : mode === 'login' ? 'LOG IN' : 'SIGN UP'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="muted" style={{ textAlign: 'right' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleReset() }}>Forgot password?</a>
          </p>
        )}

        <div className="card">
          <button className="secondary" style={{ width: '100%', marginBottom: 10 }}
            onClick={() => handleProvider(signInWithGoogle)}>Continue with Google</button>
          <button className="secondary" style={{ width: '100%', marginBottom: 10 }}
            onClick={() => handleProvider(signInWithApple)}>Continue with Apple</button>
          <button className="secondary" style={{ width: '100%' }}
            onClick={() => handleProvider(signInAsGuest)}>Continue as Guest</button>
        </div>

        <p className="muted" style={{ textAlign: 'center' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'signup' : 'login') }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </a>
        </p>
      </main>
    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/invalid-email': 'That email address looks wrong.',
    'auth/user-not-found': 'No account found with that email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists with that email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/unauthorized-domain': 'This domain isn\u2019t authorized for sign-in yet (add it in Firebase Console \u2192 Authentication \u2192 Settings \u2192 Authorized domains).',
    'auth/operation-not-allowed': 'This sign-in method isn\u2019t enabled yet (turn it on in Firebase Console \u2192 Authentication \u2192 Sign-in method).'
  }
  return map[code] || 'Something went wrong. Please try again.'
}
