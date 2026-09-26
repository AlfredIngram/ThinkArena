import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'
import { fetchProfile, type ProfileRow } from '../services/remote'

interface SignResult {
  ok: boolean
  error?: string
  /** True when signup succeeded but Supabase requires email confirmation. */
  needsEmailConfirm?: boolean
}

interface AuthValue {
  /** Whether Supabase env vars are present (false → local-only mode). */
  configured: boolean
  loading: boolean
  session: Session | null
  user: User | null
  profile: ProfileRow | null
  signIn: (email: string, password: string) => Promise<SignResult>
  signUp: (email: string, password: string, displayName: string) => Promise<SignResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)

  // Load the stored session once, then track auth changes.
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Keep the profile row in sync with the session.
  useEffect(() => {
    if (!supabase || !session?.user) {
      setProfile(null)
      return
    }
    let active = true
    fetchProfile(session.user.id)
      .then((row) => {
        if (active) setProfile(row)
      })
      .catch(() => {
        if (active) setProfile(null)
      })
    return () => {
      active = false
    }
  }, [session?.user?.id])

  const signIn = useCallback(async (email: string, password: string): Promise<SignResult> => {
    if (!supabase) return { ok: false, error: 'Auth is not configured.' }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return error ? { ok: false, error: error.message } : { ok: true }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, displayName: string): Promise<SignResult> => {
      if (!supabase) return { ok: false, error: 'Auth is not configured.' }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: displayName.trim() || undefined } },
      })
      if (error) return { ok: false, error: error.message }
      // No session back means email confirmation is required.
      return { ok: true, needsEmailConfirm: !data.session }
    },
    [],
  )

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      profile,
      signIn,
      signUp,
      signOut,
    }),
    [loading, session, profile, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
