import { useState, type FormEvent } from 'react'
import { Gamepad2, Loader2, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Mode = 'signin' | 'signup'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      if (mode === 'signin') {
        const res = await signIn(email, password)
        if (!res.ok) setError(res.error ?? 'Could not sign in.')
      } else {
        const res = await signUp(email, password, displayName)
        if (!res.ok) {
          setError(res.error ?? 'Could not create the account.')
        } else if (res.needsEmailConfirm) {
          setNotice('Account created. Check your email to confirm, then sign in.')
          setMode('signin')
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10 tile-grid">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-electric-cyan to-indigo-600 shadow-glow">
            <Gamepad2 className="text-white" size={28} aria-hidden />
          </span>
          <h1 className="font-display text-3xl text-white text-outline">
            LEVEL UP <span className="text-electric-cyan">LEARNING</span>
          </h1>
          <p className="text-sm text-white/60">
            {mode === 'signin' ? 'Sign in to your parent account.' : 'Create a parent account to get started.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="game-panel space-y-4 p-6">
          {mode === 'signup' && (
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-white/70">Your name</span>
              <input
                className="game-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tony"
                autoComplete="name"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-bold text-white/70">Email</span>
            <input
              className="game-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-bold text-white/70">Password</span>
            <input
              className="game-input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-sm font-bold text-emerald-200">
              {notice}
            </p>
          )}

          <button type="submit" className="btn-gold w-full" disabled={busy}>
            {busy ? (
              <Loader2 className="animate-spin" size={20} aria-hidden />
            ) : mode === 'signin' ? (
              <LogIn size={20} aria-hidden />
            ) : (
              <UserPlus size={20} aria-hidden />
            )}
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>

          <button
            type="button"
            className="btn-ghost w-full text-base"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setNotice(null)
            }}
          >
            {mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
