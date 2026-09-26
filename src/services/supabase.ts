/**
 * Supabase seam — superseded.
 *
 * The Supabase client lives in `services/supabaseClient.ts` and table access in
 * `services/remote.ts`. Auth state is provided by `context/AuthContext.tsx`.
 *
 * This file is kept only as a stable re-export so older imports don't break.
 * Prefer importing from the modules above directly.
 */

export { supabase, requireSupabase, isSupabaseConfigured } from './supabaseClient'
