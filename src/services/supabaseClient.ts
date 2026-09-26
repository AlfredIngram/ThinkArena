import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client.
 *
 * Configured by two Vite env vars (set them in Netlify and redeploy):
 *   VITE_SUPABASE_URL
 *   VITE_SUPABASE_ANON_KEY   (the *publishable* key — safe in the browser)
 *
 * If either is missing the app falls back to local-only mode (the original
 * localStorage behaviour) so the site keeps working before the env vars land.
 */

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

/** True once both env vars are present at build time. */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/** Throwing accessor for code paths that only run when configured. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).')
  }
  return supabase
}
