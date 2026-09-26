import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [activeId, setActiveId] = useState<string | null>(() => localStorage.getItem(ACTIVE_KEY))
  const [error, setError] = useState<string | null>(null)

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
      students,
      activeStudent,
      error,
      selectStudent,
      addStudent,
      renameStudent,
      removeStudent,
      refresh: load,
    }),
    [loading, students, activeStudent, error, selectStudent, addStudent, renameStudent, removeStudent, load],
  )

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
}

export function useStudents(): StudentValue {
  const ctx = useContext(StudentContext)
  if (!ctx) throw new Error('useStudents must be used inside <StudentProvider>')
  return ctx
}
