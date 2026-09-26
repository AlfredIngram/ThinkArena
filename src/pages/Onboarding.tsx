import { useState, type FormEvent } from 'react'
import { Check, Loader2, Pencil, Rocket, Users, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStudents } from '../context/StudentContext'
import { Splash } from '../components/Splash'

/**
 * Shown once a parent is signed in. Lists the kids on the account and lets the
 * parent add another. Selecting a kid mounts the game with that kid's data.
 */
export function Onboarding() {
  const { profile, signOut } = useAuth()
  const { loading, students, error, addStudent, selectStudent, removeStudent, renameStudent } =
    useStudents()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [renaming, setRenaming] = useState(false)

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

  function startEdit(id: string, current: string) {
    setEditingId(id)
    setEditName(current)
  }

  async function commitEdit() {
    if (!editingId) return
    const next = editName.trim()
    const current = students.find((s) => s.id === editingId)?.name
    if (!next || next === current) {
      setEditingId(null)
      return
    }
    setRenaming(true)
    try {
      await renameStudent(editingId, next)
      setEditingId(null)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not rename the learner.')
    } finally {
      setRenaming(false)
    }
  }

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
                {editingId === student.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      className="game-input py-1 text-base"
                      value={editName}
                      autoFocus
                      maxLength={40}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void commitEdit()
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                    <button
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/20 text-emerald-200"
                      title="Save name"
                      disabled={renaming}
                      onClick={() => void commitEdit()}
                    >
                      {renaming ? (
                        <Loader2 className="animate-spin" size={16} aria-hidden />
                      ) : (
                        <Check size={16} aria-hidden />
                      )}
                    </button>
                    <button
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-white/50"
                      title="Cancel"
                      onClick={() => setEditingId(null)}
                    >
                      <X size={16} aria-hidden />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="truncate font-display text-lg text-white">{student.name}</p>
                    <button
                      className="text-white/40 hover:text-white"
                      title="Rename"
                      onClick={() => startEdit(student.id, student.name)}
                    >
                      <Pencil size={14} aria-hidden />
                    </button>
                  </div>
                )}
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
