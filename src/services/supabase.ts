/**
 * Supabase-ready seam.
 *
 * The MVP runs entirely on localStorage, but every read/write goes through
 * `services/storage.ts`. To move to Supabase later:
 *
 *   1. `npm i @supabase/supabase-js`
 *   2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 *   3. Implement the `RemoteAdapter` interface below against your tables
 *   4. In `storage.ts`, switch `activeAdapter` to `remoteAdapter`
 *
 * The shape of each persisted object maps 1:1 onto a table row, so no data
 * migration is needed - just write the rows.
 */

export interface RemoteAdapter {
  fetchStudent(): Promise<unknown | null>
  saveStudent(student: unknown): Promise<void>
  fetchLesson(): Promise<unknown | null>
  saveLesson(lesson: unknown): Promise<void>
  fetchProgress(): Promise<unknown | null>
  saveProgress(progress: unknown): Promise<void>
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True once Supabase env vars are configured. */
export const supabaseConfigured = Boolean(url && anonKey)

export const supabaseConfig = { url, anonKey }

/**
 * Suggested schema (SQL) for the future migration:
 *
 *   create table students (
 *     id uuid primary key default gen_random_uuid(),
 *     name text not null,
 *     profile jsonb not null default '{}'::jsonb,
 *     created_at timestamptz default now()
 *   );
 *
 *   create table weekly_lessons (
 *     id uuid primary key default gen_random_uuid(),
 *     student_id uuid references students(id) on delete cascade,
 *     week_of date not null,
 *     lesson jsonb not null
 *   );
 *
 *   create table student_progress (
 *     student_id uuid primary key references students(id) on delete cascade,
 *     progress jsonb not null,
 *     updated_at timestamptz default now()
 *   );
 *
 * Row Level Security should scope every row to auth.uid().
 */
export const SUPABASE_SETUP_NOTES = `
1. Create a Supabase project.
2. Add tables: students, weekly_lessons, student_progress (see storage.ts).
3. Enable RLS and add policies scoping rows to auth.uid().
4. Add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to Netlify env vars.
5. Implement RemoteAdapter and flip activeAdapter in services/storage.ts.
`
