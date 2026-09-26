import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import {
  createStudentRow,
  deleteStudentRow,
  listStudents,
  renameStudentRow,
  type StudentRow,
} from '../services/remote'

interface StudentValue {
  loading: boolean
  /** True while the primary learner is being created for a fresh account. */
  provisioning: boolean
  students: StudentRow[]
  activeStudent: StudentRow | null
  error: string | null
  selectStudent: (id: string) => void
  addStudent: (name: string) => Promise<StudentRow>
  renameStudent: (id: string, name: string) => Promise<void>
  removeStudent: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

const StudentContext = createContext<StudentValue | null>(null)

const ACTIVE_KEY = 'lul.activeStudent'

export function StudentProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [provisioning, setProvisioning] = useState(false)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_KEY))
  const [error, setError] = useState<string | null>(null)
  const provisionedRef = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const rows = await listStudents()
      setStudents(rows)
      // Default the active student to the stored one (if still valid) or the first.
      setActiveId((prev) => {
        const valid = prev && rows.some((r) => r.id === prev)
        return valid ? prev : (rows[0]?.id ?? null)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load student profiles.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setStudents([])
      setActiveId(null)
      setLoading(false)
      return
    }
    void load()
  }, [user?.id, load])

  // Reset the one-shot provisioning guard whenever the account changes.
  useEffect(() => {
    provisionedRef.current = false
  }, [user?.id])

  const selectStudent = useCallback((id: string) => {
    setActiveId(id)
    localStorage.setItem(ACTIVE_KEY, id)
  }, [])

  const addStudent = useCallback(async (name: string) => {
    const row = await createStudentRow(name.trim() || 'Student')
    setStudents((prev) => [...prev, row])
    setActiveId(row.id)
    localStorage.setItem(ACTIVE_KEY, row.id)
    return row
  }, [])

  // Every account gets a primary learner automatically — no forced onboarding.
  // (New signups also get one from a DB trigger; this covers legacy/edge cases.)
  useEffect(() => {
    if (!user || loading || students.length > 0) return
    if (provisionedRef.current) return
    provisionedRef.current = true
    let active = true
    setProvisioning(true)
    const name =
      profile?.display_name?.trim() || profile?.email?.split('@')[0]?.trim() || 'My Learner'
    addStudent(name)
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Could not create the primary learner.',
          )
        }
      })
      .finally(() => {
        if (active) setProvisioning(false)
      })
    return () => {
      active = false
    }
  }, [user, loading, students.length, profile, addStudent])

  const renameStudent = useCallback(async (id: string, name: string) => {
    await renameStudentRow(id, name)
    setStudents((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)))
  }, [])

  const removeStudent = useCallback(
    async (id: string) => {
      await deleteStudentRow(id)
      setStudents((prev) => {
        const next = prev.filter((r) => r.id !== id)
        setActiveId((cur) => {
          if (cur !== id) return cur
          const fallback = next[0]?.id ?? null
          if (fallback) localStorage.setItem(ACTIVE_KEY, fallback)
          else localStorage.removeItem(ACTIVE_KEY)
          return fallback
        })
        return next
      })
    },
    [],
  )

  const activeStudent = useMemo(
    () => students.find((s) => s.id === activeId) ?? students[0] ?? null,
    [students, activeId],
  )

  const value = useMemo<StudentValue>(
    () => ({
      loading,
      provisioning,
      students,
      activeStudent,
      error,
      selectStudent,
      addStudent,
      renameStudent,
      removeStudent,
      refresh: load,
    }),
    [loading, provisioning, students, activeStudent, error, selectStudent, addStudent, renameStudent, removeStudent, load],
  )

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
}

export function useStudents(): StudentValue {
  const ctx = useContext(StudentContext)
  if (!ctx) throw new Error('useStudents must be used inside <StudentProvider>')
  return ctx
}
