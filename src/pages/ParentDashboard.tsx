import { useMemo, useState } from 'react'
import {
  BookOpen,
  Download,
  GraduationCap,
  Lock,
  RefreshCw,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  Trash2,
  Unlock,
} from 'lucide-react'
import { useGame } from '../context/GameContext'
import { GameCard } from '../components/GameCard'
import { AvatarCard } from '../components/AvatarCard'
import * as storage from '../services/storage'
import { masteredCount, MASTERY_THRESHOLD, weakestWords } from '../services/adaptiveLearning'
import type { DifficultyLevel, MathTopic, WeeklyLesson } from '../types'

const MATH_TOPICS: { id: MathTopic; label: string }[] = [
  { id: 'addition', label: 'Addition' },
  { id: 'subtraction', label: 'Subtraction' },
  { id: 'multiplication', label: 'Multiplication' },
  { id: 'division', label: 'Division' },
  { id: 'wordProblems', label: 'Word problems' },
  { id: 'mixed', label: 'Mixed review' },
]

const DIFFICULTIES: { value: DifficultyLevel; label: string }[] = [
  { value: 1, label: '1 · Gentle' },
  { value: 2, label: '2 · On grade' },
  { value: 3, label: '3 · Challenging' },
  { value: 4, label: '4 · Stretch' },
]

/** PIN-gated grown-up console: edit the weekly lesson and audit progress. */
export function ParentDashboard() {
  const game = useGame()
  const { student, lesson, progress } = game

  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)

  // Draft lesson, so edits are explicit (Save applies them).
  const [draft, setDraft] = useState<WeeklyLesson>(lesson)
  const [wordsText, setWordsText] = useState(lesson.spellingWords.join('\n'))
  const [saved, setSaved] = useState(false)
  const [dangerArmed, setDangerArmed] = useState<string | null>(null)

  const parsedWords = useMemo(
    () => wordsText.split('\n').map((w) => w.trim()).filter(Boolean),
    [wordsText],
  )

  const mastered = useMemo(
    () => masteredCount(lesson.spellingWords, progress.spelling),
    [lesson.spellingWords, progress.spelling],
  )
  const weakest = useMemo(
    () => weakestWords(lesson.spellingWords, progress.spelling).slice(0, 5),
    [lesson.spellingWords, progress.spelling],
  )

  function tryUnlock() {
    if (pin === student.pin) {
      setUnlocked(true)
      setPinError(false)
    } else {
      setPinError(true)
    }
    setPin('')
  }

  function patchDraft(partial: Partial<WeeklyLesson>) {
    setDraft((prev) => ({ ...prev, ...partial }))
    setSaved(false)
  }

  function saveLesson() {
    game.saveLesson({ ...draft, spellingWords: parsedWords })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  function downloadData() {
    const blob = new Blob([JSON.stringify(storage.exportAll(), null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `level-up-learning-${lesson.weekOf}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GameCard className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-purple-500/20">
              <Lock className="text-purple-200" size={28} aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-2xl text-white">PARENT MODE</h1>
              <p className="mt-1 text-sm text-white/60">
                Enter the 4-digit PIN to set up this week&apos;s lesson.
              </p>
            </div>
            <input
              className="game-input w-full text-center font-display text-2xl tracking-[0.5em]"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              autoFocus
              placeholder="••••"
              aria-label="Parent PIN"
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
            />
            {pinError && <p className="text-sm text-orange-200">Wrong PIN — try again.</p>}
            <button className="btn-primary w-full" onClick={tryUnlock}>
              <Unlock size={18} aria-hidden /> Unlock
            </button>
            <p className="text-[11px] text-white/40">Default PIN is 1234 — change it below.</p>
          </div>
        </GameCard>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="flex items-center justify-center gap-2 font-display text-4xl text-white text-outline">
          <Shield size={30} aria-hidden /> PARENT MODE
        </h1>
        <p className="text-white/70">Set up the week and check in on progress.</p>
      </header>

      {/* Student */}
      <GameCard>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <AvatarCard student={student} size="md" />
          <div className="flex-1 space-y-3">
            <h2 className="flex items-center gap-2 font-display text-xl text-white">
              <GraduationCap size={20} aria-hidden /> Student
            </h2>
            <div className="flex flex-wrap gap-3">
              <label className="flex-1 min-w-[160px] text-left">
                <span className="mb-1 block text-xs uppercase tracking-wide text-white/60">Name</span>
                <input
                  className="game-input w-full"
                  value={student.name}
                  onChange={(e) => game.saveStudent({ name: e.target.value })}
                />
              </label>
              <label className="min-w-[120px] text-left">
                <span className="mb-1 block text-xs uppercase tracking-wide text-white/60">Parent PIN</span>
                <input
                  className="game-input w-full text-center tracking-[0.4em]"
                  inputMode="numeric"
                  maxLength={4}
                  value={student.pin}
                  onChange={(e) => game.saveStudent({ pin: e.target.value.replace(/\D/g, '') })}
                />
              </label>
            </div>
          </div>
        </div>
      </GameCard>

      {/* Weekly lesson */}
      <GameCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-display text-xl text-white">
            <BookOpen size={20} aria-hidden /> This week&apos;s lesson
          </h2>
          <span className="chip">Week of {lesson.weekOf}</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="text-left">
            <span className="mb-1 block text-xs uppercase tracking-wide text-white/60">
              Spelling words (one per line)
            </span>
            <textarea
              className="game-input min-h-[180px] w-full font-mono text-sm"
              value={wordsText}
              onChange={(e) => {
                setWordsText(e.target.value)
                setSaved(false)
              }}
            />
            <span className="mt-1 block text-[11px] text-white/40">
              {parsedWords.length} words · {mastered} mastered (≥{MASTERY_THRESHOLD}%)
            </span>
          </label>

          <div className="space-y-3 text-left">
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wide text-white/60">Verse reference</span>
              <input
                className="game-input w-full"
                value={draft.bibleVerse.reference}
                onChange={(e) =>
                  patchDraft({ bibleVerse: { ...draft.bibleVerse, reference: e.target.value } })
                }
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs uppercase tracking-wide text-white/60">Verse text</span>
              <textarea
                className="game-input min-h-[120px] w-full text-sm"
                value={draft.bibleVerse.text}
                onChange={(e) => patchDraft({ bibleVerse: { ...draft.bibleVerse, text: e.target.value } })}
              />
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="text-left">
            <span className="mb-2 block text-xs uppercase tracking-wide text-white/60">Math topics</span>
            <div className="flex flex-wrap gap-2">
              {MATH_TOPICS.map((t) => {
                const active = draft.math.topics.includes(t.id)
                return (
                  <button
                    key={t.id}
                    className={`chip ${active ? 'border-electric-cyan/60 bg-electric-cyan/15 text-white' : ''}`}
                    aria-pressed={active}
                    onClick={() =>
                      patchDraft({
                        math: {
                          ...draft.math,
                          topics: active
                            ? draft.math.topics.filter((x) => x !== t.id)
                            : [...draft.math.topics, t.id],
                        },
                      })
                    }
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
          <label className="text-left">
            <span className="mb-1 block text-xs uppercase tracking-wide text-white/60">Difficulty</span>
            <select
              className="game-input w-full"
              value={draft.math.difficulty}
              onChange={(e) =>
                patchDraft({ math: { ...draft.math, difficulty: Number(e.target.value) as DifficultyLevel } })
              }
            >
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {(
            [
              ['spellingWordsGoal', 'Spelling goal'],
              ['mathProblemsGoal', 'Math goal'],
              ['versePracticeGoal', 'Verse goal'],
              ['weeklyXpGoal', 'Weekly XP goal'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-left">
              <span className="mb-1 block text-xs uppercase tracking-wide text-white/60">{label}</span>
              <input
                type="number"
                min={0}
                className="game-input w-full"
                value={draft.goals[key]}
                onChange={(e) => patchDraft({ goals: { ...draft.goals, [key]: Number(e.target.value) } })}
              />
            </label>
          ))}
        </div>

        <label className="mt-3 block text-left">
          <span className="mb-1 block text-xs uppercase tracking-wide text-white/60">
            Reward multiplier ({draft.reward.multiplier.toFixed(1)}×)
          </span>
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.5}
            value={draft.reward.multiplier}
            onChange={(e) =>
              patchDraft({ reward: { ...draft.reward, multiplier: Number(e.target.value) } })
            }
            className="w-full"
          />
        </label>

        <div className="mt-5 border-t border-white/10 pt-4">
          <span className="mb-2 block text-xs uppercase tracking-wide text-white/60">
            Long-term goals (shown on the Goals page)
          </span>
          <div className="grid gap-3 sm:grid-cols-4">
            {(
              [
                ['monthlyXpGoal', 'Monthly XP'],
                ['monthlyCorrectGoal', 'Monthly correct'],
                ['yearlyXpGoal', 'Yearly XP'],
                ['yearlyCorrectGoal', 'Yearly correct'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-left">
                <span className="mb-1 block text-xs uppercase tracking-wide text-white/60">{label}</span>
                <input
                  type="number"
                  min={0}
                  className="game-input w-full"
                  value={draft.longGoals[key]}
                  onChange={(e) =>
                    patchDraft({
                      longGoals: { ...draft.longGoals, [key]: Number(e.target.value) },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button className="btn-success" onClick={saveLesson}>
            <Save size={18} aria-hidden /> Save lesson
          </button>
          <button className="btn-ghost" onClick={() => setDraft(lesson)}>
            <RotateCcw size={18} aria-hidden /> Revert
          </button>
          {saved && <span className="text-sm text-lime-200">Saved ✓</span>}
        </div>
      </GameCard>

      {/* Progress snapshot */}
      <GameCard>
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl text-white">
          <Sparkles size={20} aria-hidden /> Progress
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            ['XP', progress.xp.toLocaleString()],
            ['Level', `${progress.level}`],
            ['Coins', progress.coins.toLocaleString()],
            ['Streak', `${progress.streak} 🔥`],
            ['Bosses', `${progress.totals.bossesDefeated}`],
            ['Accuracy', `${accuracy(progress.totals)}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
              <p className="font-display text-xl text-white">{value}</p>
              <p className="text-[11px] uppercase tracking-wide text-white/60">{label}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-5 mb-2 font-display text-lg text-white/90">Needs practice</h3>
        {weakest.length ? (
          <ul className="flex flex-wrap gap-2">
            {weakest.map((w) => (
              <li key={w.word} className="chip">
                {w.word} · {w.mastery}%
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/50">No spelling attempts recorded yet.</p>
        )}
      </GameCard>

      {/* Danger zone */}
      <GameCard className="border-orange-400/30">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl text-orange-100">
          <Trash2 size={20} aria-hidden /> Manage data
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="btn-ghost" onClick={downloadData}>
            <Download size={18} aria-hidden /> Export data
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              game.startNewWeek({ ...draft, weekOf: new Date().toISOString().slice(0, 10) })
              setDraft((d) => ({ ...d, weekOf: new Date().toISOString().slice(0, 10) }))
            }}
          >
            <RefreshCw size={18} aria-hidden /> Start new week
          </button>
          {(['week', 'progress', 'everything'] as const).map((scope) => (
            <DangerButton
              key={scope}
              label={
                scope === 'week' ? 'Reset week' : scope === 'progress' ? 'Reset progress' : 'Reset everything'
              }
              armed={dangerArmed === scope}
              onArm={() => setDangerArmed(scope)}
              onCancel={() => setDangerArmed(null)}
              onConfirm={() => {
                if (scope === 'week') game.resetWeek()
                else if (scope === 'progress') game.resetProgress()
                else {
                  game.resetEverything()
                  setDraft(lesson)
                }
                setDangerArmed(null)
              }}
            />
          ))}
        </div>
      </GameCard>
    </div>
  )
}

function accuracy(totals: { correct: number; incorrect: number }): number {
  const total = totals.correct + totals.incorrect
  return total ? Math.round((totals.correct / total) * 100) : 0
}

function DangerButton({
  label,
  armed,
  onArm,
  onCancel,
  onConfirm,
}: {
  label: string
  armed: boolean
  onArm: () => void
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!armed) {
    return (
      <button className="btn-ghost" onClick={onArm}>
        {label}
      </button>
    )
  }
  return (
    <span className="flex items-center gap-2 rounded-2xl border border-orange-400/40 bg-orange-500/10 px-3 py-1">
      <span className="text-sm text-orange-100">Sure?</span>
      <button className="btn-ghost text-sm" onClick={onConfirm}>
        Yes
      </button>
      <button className="btn-ghost text-sm" onClick={onCancel}>
        No
      </button>
    </span>
  )
}
