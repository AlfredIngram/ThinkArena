import { requireSupabase } from './supabaseClient'
import type { StudentProgress, WeeklyLesson } from '../types'

/**
 * Remote data access against the Supabase tables created by the
 * `init_auth_profiles_and_students` migration:
 *
 *   profiles          1 row per auth user (auto-created on signup by trigger)
 *   students          kid profiles, owned by a parent  (owner_id = auth.users.id)
 *   weekly_lessons    one row per student per week     (unique student_id + week_of)
 *   student_progress  one row per student
 *
 * All access is RLS-scoped to the signed-in user, so no `owner_id` filtering
 * is required in the queries — Postgres enforces it.
 */

export interface StudentRow {
  id: string
  owner_id: string
  auth_user_id: string | null
  name: string
  avatar: Record<string, unknown>
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ProfileRow {
  id: string
  email: string | null
  display_name: string | null
  role: string
}

// --- profiles --------------------------------------------------------------

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('id, email, display_name, role')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return (data as ProfileRow | null) ?? null
}

// --- students --------------------------------------------------------------

export async function listStudents(): Promise<StudentRow[]> {
  const { data, error } = await requireSupabase()
    .from('students')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as StudentRow[]
}

export async function createStudentRow(name: string): Promise<StudentRow> {
  const { data: userData, error: userError } = await requireSupabase().auth.getUser()
  if (userError) throw userError
  const ownerId = userData.user?.id
  if (!ownerId) throw new Error('Not signed in.')

  const { data, error } = await requireSupabase()
    .from('students')
    .insert({ owner_id: ownerId, name })
    .select('*')
    .single()
  if (error) throw error
  return data as StudentRow
}

export async function renameStudentRow(id: string, name: string): Promise<void> {
  const { error } = await requireSupabase().from('students').update({ name }).eq('id', id)
  if (error) throw error
}

export async function deleteStudentRow(id: string): Promise<void> {
  const { error } = await requireSupabase().from('students').delete().eq('id', id)
  if (error) throw error
}

// --- weekly lessons --------------------------------------------------------

export async function fetchLesson(studentId: string, weekOf: string): Promise<WeeklyLesson | null> {
  const { data, error } = await requireSupabase()
    .from('weekly_lessons')
    .select('lesson')
    .eq('student_id', studentId)
    .eq('week_of', weekOf)
    .maybeSingle()
  if (error) throw error
  return ((data?.lesson as WeeklyLesson | undefined) ?? null)
}

export async function saveLessonRow(
  studentId: string,
  weekOf: string,
  lesson: WeeklyLesson,
): Promise<void> {
  const { error } = await requireSupabase()
    .from('weekly_lessons')
    .upsert(
      { student_id: studentId, week_of: weekOf, lesson },
      { onConflict: 'student_id,week_of' },
    )
  if (error) throw error
}

// --- progress --------------------------------------------------------------

export async function fetchProgress(studentId: string): Promise<StudentProgress | null> {
  const { data, error } = await requireSupabase()
    .from('student_progress')
    .select('progress')
    .eq('student_id', studentId)
    .maybeSingle()
  if (error) throw error
  return ((data?.progress as StudentProgress | undefined) ?? null)
}

export async function saveProgressRow(studentId: string, progress: StudentProgress): Promise<void> {
  const { error } = await requireSupabase()
    .from('student_progress')
    .upsert({ student_id: studentId, progress }, { onConflict: 'student_id' })
  if (error) throw error
}
