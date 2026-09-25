import { Trophy } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { GameCard } from '../components/GameCard'
import { AchievementBadge } from '../components/AchievementBadge'
import { ACHIEVEMENTS } from '../data/achievements'

/** Achievements = trophy room. */
export function Achievements() {
  const { progress } = useGame()
  const unlocked = ACHIEVEMENTS.filter((a) => progress.achievements.includes(a.id))
  const locked = ACHIEVEMENTS.filter((a) => !progress.achievements.includes(a.id))

  const stats = [
    { label: 'Total XP', value: progress.xp.toLocaleString() },
    { label: 'Coins', value: progress.coins.toLocaleString() },
    { label: 'Day streak', value: `${progress.streak} 🔥` },
    { label: 'Best combo', value: `${progress.totals.bestCombo}` },
    { label: 'Perfect rounds', value: `${progress.totals.perfectRounds}` },
    { label: 'Bosses beaten', value: `${progress.totals.bossesDefeated}` },
  ]

  return (
    <div className="space-y-5">
      <header className="text-center">
        <h1 className="flex items-center justify-center gap-2 font-display text-4xl text-white text-outline">
          <Trophy size={30} aria-hidden /> TROPHY ROOM
        </h1>
        <p className="mt-1 text-white/70">
          {unlocked.length} of {ACHIEVEMENTS.length} achievements unlocked
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <GameCard key={s.label} className="text-center">
            <p className="font-display text-2xl text-white">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-white/60">{s.label}</p>
          </GameCard>
        ))}
      </div>

      {unlocked.length > 0 && (
        <section aria-label="Unlocked achievements">
          <h2 className="mb-3 font-display text-2xl text-lime-200">UNLOCKED</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {unlocked.map((a) => (
              <AchievementBadge key={a.id} achievement={a} unlocked />
            ))}
          </div>
        </section>
      )}

      <section aria-label="Locked achievements">
        <h2 className="mb-3 font-display text-2xl text-white/70">STILL TO EARN</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locked.map((a) => (
            <AchievementBadge key={a.id} achievement={a} unlocked={false} />
          ))}
        </div>
      </section>
    </div>
  )
}
