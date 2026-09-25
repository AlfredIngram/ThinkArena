import { Flame } from 'lucide-react'
import { useGame } from '../context/GameContext'

/** Streak chip: 🔥 4 DAY STREAK */
export function StreakBadge({ className = '' }: { className?: string }) {
  const { progress } = useGame()
  const active = progress.streak > 0
  return (
    <div
      className={`chip ${
        active ? 'border-orange-400/40 bg-orange-500/15 text-orange-200' : 'text-white/60'
      } ${className}`}
      aria-label={`${progress.streak} day streak`}
    >
      <Flame size={18} aria-hidden />
      <span className="font-display text-base">
        {progress.streak} DAY{progress.streak === 1 ? '' : 'S'} STREAK
      </span>
    </div>
  )
}
