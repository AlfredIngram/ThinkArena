import { useState } from 'react'
import { BookOpen, Brain, CheckCircle2, ListOrdered, Puzzle, Sparkles } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { GameCard } from '../components/GameCard'
import { ReadVerse } from '../games/verse/ReadVerse'
import { MissingWords } from '../games/verse/MissingWords'
import { VerseOrder } from '../games/verse/VerseOrder'
import { MemoryMode } from '../games/verse/MemoryMode'

type StageId = 1 | 2 | 3 | 4 | 5 | 6

const STAGES: { id: StageId; title: string; blurb: string; icon: typeof BookOpen }[] = [
  { id: 1, title: 'Read', blurb: 'Read the whole verse carefully', icon: BookOpen },
  { id: 2, title: 'Missing Words', blurb: 'A few words are hidden', icon: Puzzle },
  { id: 3, title: 'More Missing', blurb: 'Half the words are hidden', icon: Puzzle },
  { id: 4, title: 'Put It In Order', blurb: 'Rebuild the verse in order', icon: ListOrdered },
  { id: 5, title: 'Memory Mode', blurb: 'Most words are hidden', icon: Brain },
  { id: 6, title: 'Verse Master', blurb: 'Type the whole verse', icon: Sparkles },
]

/** Bible verse = treasure vault exploration. */
export function VerseVault() {
  const { lesson, progress } = useGame()
  const [stage, setStage] = useState<StageId | null>(null)

  const { reference, text } = lesson.bibleVerse
  const stats = progress.verse[reference]
  const completed = stats?.stagesCompleted ?? []
  const pct = Math.round((completed.length / 6) * 100)

  const exit = () => setStage(null)
  const common = { reference, text, onExit: exit }

  if (stage === 1) return <ReadVerse {...common} />
  if (stage === 2) return <MissingWords {...common} stage={2} />
  if (stage === 3) return <MissingWords {...common} stage={3} />
  if (stage === 4) return <VerseOrder {...common} />
  if (stage === 5) return <MemoryMode {...common} stage={5} />
  if (stage === 6) return <MemoryMode {...common} stage={6} />

  return (
    <div className="space-y-5">
      <header className="text-center">
        <h1 className="font-display text-4xl text-white text-outline">VERSE VAULT</h1>
        <p className="mt-1 text-white/70">
          {reference} · {pct}% mastered
        </p>
      </header>

      <GameCard className="border-purple-400/20 text-center">
        <p className="font-display text-sm uppercase tracking-widest text-purple-300">Today’s verse</p>
        <p className="mt-2 font-display text-xl leading-relaxed text-white">{text}</p>
        {stats?.mastered && (
          <p className="mt-3 chip mx-auto border-lime-400/40 bg-lime-500/15 text-lime-100">
            <CheckCircle2 size={16} aria-hidden /> VERSE MASTERED!
          </p>
        )}
      </GameCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAGES.map(({ id, title, blurb, icon: Icon }) => {
          const done = completed.includes(id)
          return (
            <GameCard key={id} interactive onClick={() => setStage(id)} className={done ? 'border-lime-400/40' : ''}>
              <div className="flex items-center gap-3">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${done ? 'bg-lime-500/20' : 'bg-white/5'}`}>
                  {done ? (
                    <CheckCircle2 className="text-lime-400" size={26} aria-hidden />
                  ) : (
                    <Icon className="text-purple-300" size={26} aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-lg text-white">
                    Stage {id} · {title}
                  </p>
                  <p className="text-xs text-white/60">{blurb}</p>
                </div>
              </div>
            </GameCard>
          )
        })}
      </div>

      <p className="text-center text-xs text-white/50">
        You can practise any stage at any time - no locks, just rewards!
      </p>
    </div>
  )
}
