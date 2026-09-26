import { useState, type FormEvent } from 'react'
import { Loader2, Rocket, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStudents } from '../context/StudentContext'
import { Splash } from '../components/Splash'

/**
 * Shown once a parent is signed in. Lists the kids on the account and lets the
 * parent add another. Selecting a kid mounts the game with that kid's data.
 */
export function Onboarding() {
  const { profile, signOut } = useAuth()
  const { loading, students, error, addStudent, selectStudent, removeStudent } = useStudents()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function onAdd(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setBusy(true)
    try {
      await addStudent(name)
      setName('')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not add the profile.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Splash label="Loading profiles…" />

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-white text-outline">
            Hi{profile?.display_name ? `, ${profile.display_name}` : ''} 👋
          </h1>
          <p className="text-sm text-white/60">
            {students.length > 0
              ? 'Your learners — pick one to play, or add another.'
              : 'Add a learner to get started.'}
          </p>
        </div>
        <button className="btn-ghost text-sm" onClick={() => void signOut()}>
          Sign out
        </button>
      </header>

      {error && (
        <p className="mb-4 rounded-xl border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm font-bold text-red-200">
          {error}
        </p>
      )}

      {students.length > 0 && (
        <ul className="mb-6 grid gap-3 sm:grid-cols-2">
          {students.map((student) => (
            <li key={student.id} className="game-card flex items-center gap-3 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-electric-cyan to-indigo-600 font-display text-xl text-white">
                {student.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-white">{student.name}</p>
                <button
                  className="btn-gold mt-1 px-4 text-sm"
                  onClick={() => selectStudent(student.id)}
                >
                  <Rocket size={16} aria-hidden /> Play
                </button>
              </div>
              {students.length > 1 && (
                <button
                  className="self-start text-xs text-white/40 hover:text-red-300"
                  title="Remove profile"
                  onClick={() => void removeStudent(student.id)}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onAdd} className="game-panel space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-display text-lg text-white">
          <Users size={18} aria-hidden /> Add a learner
        </h2>
        <input
          className="game-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Learner's name"
          maxLength={40}
        />
        {formError && <p className="text-sm font-bold text-red-200">{formError}</p>}
        <button type="submit" className="btn-success w-full" disabled={busy || !name.trim()}>
          {busy ? <Loader2 className="animate-spin" size={20} aria-hidden /> : <Rocket size={20} aria-hidden />}
          Create profile
        </button>
      </form>
    </div>
  )
}
