import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Crown, Flag, Lock, Map as MapIcon, Sparkles, Swords, BookOpen } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { GameCard } from '../components/GameCard'
import { WEEK_DAY_LABELS, weekDayIndex } from '../utils/date'
interface Node {
  id: string
  day: string
  title: string
  blurb: string
  to: string
  icon: typeof BookOpen
  value: (weekly: { spellingCorrect: number; mathCorrect: number; verseStages: number; xp: number }) => number
  target: number
}

const NODES: Node[] = [
  {
    id: 'mon',
    day: 'MON',
    title: 'Spelling Training',
    blurb: 'Warm up with the weekly words',
    to: '/spelling',
    icon: BookOpen,
    value: (w) => w.spellingCorrect,
    target: 5,
  },
  {
    id: 'tue',
    day: 'TUE',
    title: 'Math Challenge',
    blurb: 'Battle through the arena',
    to: '/math',
    icon: Swords,
    value: (w) => w.mathCorrect,
    target: 10,
  },
  {
    id: 'wed',
    day: 'WED',
    title: 'Verse Vault',
    blurb: 'Practise the weekly verse',
    to: '/verse',
    icon: Sparkles,
    value: (w) => w.verseStages,
    target: 1,
  },
  {
    id: 'thu',
    day: 'THU',
    title: 'Review Mission',
    blurb: 'Mix spelling and math practice',
    to: '/spelling',
    icon: Flag,
    value: (w) => w.spellingCorrect + w.mathCorrect,
    target: 20,
  },
  {
    id: 'fri',
    day: 'FRI',
    title: 'FINAL BOSS',
    blurb: 'Face the weekly boss battle',
    to: '/spelling',
    icon: Crown,
    value: (w) => w.xp,
    target: 500,
  },
]

/** Weekly progress drawn as a game map with claimable checkpoints. */
export function WeeklyMap() {
  const { progress, markCheckpoint, buzz } = useGame()
  const today = weekDayIndex()

  function claim(node: Node) {
    markCheckpoint(node.id)
    buzz('achievement')
  }

  const doneCount = progress.weeklyCheckpoints.length

  return (
    <div className="space-y-5">
      <header className="text-center">
        <h1 className="flex items-center justify-center gap-2 font-display text-4xl text-white text-outline">
          <MapIcon size={30} aria-hidden /> WEEKLY MAP
        </h1>
        <p className="mt-1 text-white/70">
          {doneCount} of {NODES.length} checkpoints reached this week
        </p>
      </header>

      <div className="mx-auto max-w-2xl">
        {NODES.map((node, i) => {
          const Icon = node.icon
          const value = node.value(progress.weekly)
          const reached = value >= node.target
          const done = progress.weeklyCheckpoints.includes(node.id)
          const isToday = i === today
          const locked = !reached && !done

          return (
            <div key={node.id}>
              <GameCard
                className={`relative ${done ? 'border-lime-400/50' : isToday ? 'border-electric-cyan/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
                      done ? 'bg-lime-500/20' : locked ? 'bg-white/5' : 'bg-electric-cyan/15'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="text-lime-400" size={30} aria-hidden />
                    ) : locked ? (
                      <Lock className="text-white/40" size={26} aria-hidden />
                    ) : (
                      <Icon className="text-electric-cyan" size={28} aria-hidden />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-black/40 px-2 py-0.5 font-display text-xs text-white/70">
                        {node.day}
                      </span>
                      <p className="font-display text-lg text-white">{node.title}</p>
                      {isToday && (
                        <span className="rounded-full bg-electric-cyan/20 px-2 py-0.5 text-[10px] font-bold text-cyan-100">
                          TODAY
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60">{node.blurb}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-electric-cyan to-lime-400"
                          initial={false}
                          animate={{ width: `${Math.min(100, (value / node.target) * 100)}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-[11px] font-bold text-white/60">
                        {Math.min(value, node.target)}/{node.target}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {done ? (
                      <span className="chip border-lime-400/40 bg-lime-500/15 text-lime-100">Done</span>
                    ) : reached ? (
                      <button className="btn-success text-base" onClick={() => claim(node)}>
                        Claim
                      </button>
                    ) : (
                      <Link to={node.to} className="btn-ghost text-base">
                        Play
                      </Link>
                    )}
                  </div>
                </div>
              </GameCard>

              {i < NODES.length - 1 && (
                <div className="my-1 flex justify-center" aria-hidden>
                  <div className={`h-8 w-1.5 rounded-full ${done ? 'bg-lime-400/60' : 'bg-white/10'}`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
