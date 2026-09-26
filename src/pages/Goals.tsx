import { useMemo, useState } from 'react'
import {
  CalendarDays,
  CalendarRange,
  Flame,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useGame } from '../context/GameContext'
import { GameCard } from '../components/GameCard'
import { Heatmap } from '../components/Heatmap'
import { ProgressRing } from '../components/ProgressRing'
import { activeDays, bestWeek, heatmap, monthTotals, yearTotals } from '../services/timeframeEngine'
import {
  daysInMonth,
  daysInYear,
  monthKey,
  monthLabel,
  weekKey,
  yearKey,
} from '../utils/date'

type Tab = 'weekly' | 'monthly' | 'yearly'

const TABS: { id: Tab; label: string; icon: typeof Target }[] = [
  { id: 'weekly', label: 'Weekly', icon: CalendarDays },
  { id: 'monthly', label: 'Monthly', icon: CalendarRange },
  { id: 'yearly', label: 'Yearly', icon: TrendingUp },
]

/** Goals = multi-timeframe progress board (week / month / year + heatmap). */
export function Goals() {
  const { progress, lesson } = useGame()
  const [tab, setTab] = useState<Tab>('weekly')

  const month = monthKey()
  const year = yearKey()

  const weekly = progress.weekly
  const monthData = useMemo(() => monthTotals(progress.history, month), [progress.history, month])
  const yearData = useMemo(() => yearTotals(progress.history, year), [progress.history, year])
  const monthActive = useMemo(() => activeDays(progress.history, month), [progress.history, month])
  const yearActive = useMemo(() => activeDays(progress.history, year), [progress.history, year])
  const yearBest = useMemo(() => bestWeek(progress.history, year), [progress.history, year])
  const yearCells = useMemo(
    () => heatmap(progress.history, daysInYear(Number(year))),
    [progress.history, year],
  )
  const monthCells = useMemo(
    () => heatmap(progress.history, daysInMonth(month)),
    [progress.history, month],
  )

  const goals = lesson.goals
  const long = lesson.longGoals

  return (
    <div className="space-y-5">
      <header className="text-center">
        <h1 className="flex items-center justify-center gap-2 font-display text-4xl text-white text-outline">
          <Target size={30} aria-hidden /> GOALS
        </h1>
        <p className="mt-1 text-white/70">Track your progress this week, this month, and this year</p>
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`flex min-h-[44px] items-center gap-2 rounded-2xl border px-5 text-sm font-bold transition-colors ${
              tab === id
                ? 'border-electric-cyan/60 bg-electric-cyan/15 text-white'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
          >
            <Icon size={18} aria-hidden /> {label}
          </button>
        ))}
      </div>

      {tab === 'weekly' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <GameCard className="lg:col-span-1">
            <div className="flex flex-col items-center gap-4">
              <ProgressRing
                percent={pct(weekly.xp, goals.weeklyXpGoal)}
                label="Weekly XP"
                sublabel={`${weekly.xp} / ${goals.weeklyXpGoal}`}
                color="#a3e635"
              />
              <div className="flex flex-wrap justify-center gap-2">
                <span className="chip">
                  <Flame size={15} className="text-orange-300" aria-hidden /> {progress.streak} day streak
                </span>
                <span className="chip">
                  <Sparkles size={15} className="text-electric-cyan" aria-hidden /> {weekly.coins} coins
                </span>
              </div>
              <p className="text-center text-xs text-white/50">Week of {lesson.weekOf}</p>
            </div>
          </GameCard>

          <GameCard className="lg:col-span-2">
            <h2 className="mb-4 font-display text-xl text-white">This week&apos;s targets</h2>
            <div className="space-y-4">
              <GoalBar label="Spelling words correct" value={weekly.spellingCorrect} target={goals.spellingWordsGoal} color="from-electric-cyan to-electric-blue" />
              <GoalBar label="Math problems correct" value={weekly.mathCorrect} target={goals.mathProblemsGoal} color="from-orange-400 to-rose-500" />
              <GoalBar label="Verse practice" value={weekly.verseStages} target={goals.versePracticeGoal} color="from-fuchsia-400 to-purple-600" />
              <GoalBar label="Weekly XP" value={weekly.xp} target={goals.weeklyXpGoal} color="from-lime-400 to-emerald-500" />
            </div>
            <p className="mt-4 text-xs text-white/50">
              {progress.weeklyCheckpoints.length} weekly map checkpoints claimed · week key {weekKey()}
            </p>
          </GameCard>
        </div>
      )}

      {tab === 'monthly' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Month XP" value={monthData.xp.toLocaleString()} />
            <StatTile label="Correct answers" value={monthData.correct.toLocaleString()} />
            <StatTile label="Days active" value={`${monthActive}`} />
            <StatTile label="Coins earned" value={monthData.coins.toLocaleString()} />
          </div>

          <GameCard>
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-white">
              <CalendarRange size={20} aria-hidden /> {monthLabel(month)}
            </h2>
            <div className="space-y-4">
              <GoalBar label="Monthly XP" value={monthData.xp} target={long.monthlyXpGoal} color="from-lime-400 to-emerald-500" />
              <GoalBar label="Monthly correct answers" value={monthData.correct} target={long.monthlyCorrectGoal} color="from-electric-cyan to-electric-blue" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Spelling correct" value={monthData.spellingCorrect} />
              <MiniStat label="Math correct" value={monthData.mathCorrect} />
              <MiniStat label="Verse stages" value={monthData.verseStages} />
            </div>
          </GameCard>

          <GameCard>
            <h3 className="mb-3 font-display text-lg text-white/90">Daily activity</h3>
            <Heatmap cells={monthCells} year={year} label="Month" />
            <p className="mt-2 text-xs text-white/50">
              {monthActive} of {monthCells.length} days had activity
            </p>
          </GameCard>
        </div>
      )}

      {tab === 'yearly' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label="Year XP" value={yearData.xp.toLocaleString()} />
            <StatTile label="Correct answers" value={yearData.correct.toLocaleString()} />
            <StatTile label="Days active" value={`${yearActive}`} />
            <StatTile label="Best week" value={yearBest.xp ? `${yearBest.xp.toLocaleString()} XP` : '—'} />
          </div>

          <GameCard>
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl text-white">
              <TrendingUp size={20} aria-hidden /> {year} goals
            </h2>
            <div className="space-y-4">
              <GoalBar label="Yearly XP" value={yearData.xp} target={long.yearlyXpGoal} color="from-lime-400 to-emerald-500" />
              <GoalBar label="Yearly correct answers" value={yearData.correct} target={long.yearlyCorrectGoal} color="from-electric-cyan to-electric-blue" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Spelling correct" value={yearData.spellingCorrect} />
              <MiniStat label="Math correct" value={yearData.mathCorrect} />
              <MiniStat label="Verse stages" value={yearData.verseStages} />
            </div>
          </GameCard>

          <GameCard>
            <h3 className="mb-3 font-display text-lg text-white/90">This year at a glance</h3>
            <Heatmap cells={yearCells} year={year} label="Year" />
          </GameCard>
        </div>
      )}
    </div>
  )
}

function pct(value: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((value / target) * 100))
}

function GoalBar({
  label,
  value,
  target,
  color,
}: {
  label: string
  value: number
  target: number
  color: string
}) {
  const percent = pct(value, target)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span className="font-bold text-white/70">
          {Math.min(value, target)} / {target}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-black/40">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${percent}%`, transition: 'width .4s ease' }}
        />
      </div>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <p className="font-display text-2xl text-white">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-white/60">{label}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="font-display text-xl text-white">{value.toLocaleString()}</p>
      <p className="text-[11px] uppercase tracking-wide text-white/60">{label}</p>
    </div>
  )
}
