import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { useAnimations } from '../hooks/useAnimations'

interface XPBarProps {
  /** Optional override; defaults to the live student level. */
  compact?: boolean
}

/** Level + animated XP progress bar. */
export function XPBar({ compact = false }: XPBarProps) {
  const { level } = useGame()
  const animate = useAnimations()

  return (
    <div className="w-full" aria-label={`Level ${level.level}: ${level.current} of ${level.needed} XP`}>
      <div className="mb-1 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-cyan-200/90">
        <span className="flex items-center gap-1">
          <Sparkles size={14} aria-hidden /> Level {level.level}
        </span>
        <span className="text-white/70">
          {level.current} / {level.needed} XP
        </span>
      </div>
      <div
        className="h-4 w-full overflow-hidden rounded-full border border-white/10 bg-black/40"
        role="progressbar"
        aria-valuenow={level.current}
        aria-valuemin={0}
        aria-valuemax={level.needed}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-electric-cyan via-electric-blue to-indigo-500 shadow-[0_0_16px_rgba(34,211,238,0.7)]"
          initial={false}
          animate={{ width: `${level.percent}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, duration: animate ? undefined : 0 }}
        />
      </div>
      {!compact && (
        <p className="mt-1 text-[11px] text-white/50">
          Earn XP in every quest to reach Level {level.level + 1}
        </p>
      )}
    </div>
  )
}
