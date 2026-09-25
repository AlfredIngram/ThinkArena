import { useState } from 'react'
import { BookText, Infinity as InfinityIcon, Layers, Skull, Swords } from 'lucide-react'
import type { DifficultyLevel } from '../types'
import { useGame } from '../context/GameContext'
import { GameCard } from '../components/GameCard'
import { QuickBattle } from '../games/math/QuickBattle'
import { Survival } from '../games/math/Survival'
import { MathBoss } from '../games/math/MathBoss'
import { WordProblems } from '../games/math/WordProblems'
import { MixedReview } from '../games/math/MixedReview'
import { DIFFICULTY_LABELS, MATH_TOPIC_LABELS } from '../utils/math'

type ModeId = 'quick' | 'survival' | 'boss' | 'word' | 'mixed'

const MODES: { id: ModeId; title: string; blurb: string; icon: typeof Swords; color: string }[] = [
  { id: 'quick', title: 'Quick Battle', blurb: '10 questions, beat the enemies', icon: Swords, color: 'text-electric-orange' },
  { id: 'survival', title: 'Survival Mode', blurb: 'Go as long as you can', icon: InfinityIcon, color: 'text-electric-lime' },
  { id: 'boss', title: 'MATH BOSS', blurb: 'Big enemy, combo attacks', icon: Skull, color: 'text-rose-300' },
  { id: 'word', title: 'Word Problems', blurb: 'Story problems to solve', icon: BookText, color: 'text-electric-cyan' },
  { id: 'mixed', title: 'Mixed Review', blurb: 'Everything mixed together', icon: Layers, color: 'text-electric-pink' },
]

/** Math = battle arena. */
export function MathBattle() {
  const { lesson, updateLesson } = useGame()
  const [mode, setMode] = useState<ModeId | null>(null)

  const { topics, difficulty } = lesson.math
  const exit = () => setMode(null)

  const setDifficulty = (d: DifficultyLevel) => {
    updateLesson({ math: { ...lesson.math, difficulty: d } })
  }

  if (mode === 'quick') return <QuickBattle topics={topics} difficulty={difficulty} onExit={exit} />
  if (mode === 'survival') return <Survival topics={topics} difficulty={difficulty} onExit={exit} />
  if (mode === 'boss') return <MathBoss topics={topics} difficulty={difficulty} onExit={exit} />
  if (mode === 'word') return <WordProblems topics={topics} difficulty={difficulty} onExit={exit} />
  if (mode === 'mixed') return <MixedReview topics={topics} difficulty={difficulty} onExit={exit} />

  return (
    <div className="space-y-5">
      <header className="text-center">
        <h1 className="font-display text-4xl text-white text-outline">MATH BATTLE ARENA</h1>
        <p className="mt-1 text-white/70">Choose your challenge and defeat the enemies</p>
      </header>

      <GameCard>
        <p className="font-display text-sm uppercase tracking-widest text-electric-orange">Difficulty</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-4">
          {([1, 2, 3, 4] as DifficultyLevel[]).map((d) => (
            <button
              key={d}
              className={`min-h-[52px] rounded-2xl border-2 px-3 text-sm font-bold transition-all ${
                difficulty === d
                  ? 'border-electric-orange bg-orange-500/20 text-white'
                  : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
              }`}
              onClick={() => setDifficulty(d)}
              aria-pressed={difficulty === d}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/60">
          Topics: {topics.length ? topics.map((t) => MATH_TOPIC_LABELS[t]).join(', ') : 'Mixed'} · change
          these in Parent Mode
        </p>
      </GameCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map(({ id, title, blurb, icon: Icon, color }) => (
          <GameCard key={id} interactive onClick={() => setMode(id)} className="text-center">
            <Icon className={`mx-auto ${color}`} size={34} aria-hidden />
            <p className="mt-3 font-display text-lg text-white">{title}</p>
            <p className="mt-1 text-xs text-white/60">{blurb}</p>
          </GameCard>
        ))}
      </div>
    </div>
  )
}
