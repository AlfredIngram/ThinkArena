import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface BossHealthBarProps {
  name: string
  current: number
  max: number
  art?: string
  tone?: 'danger' | 'gold'
}

/** Big enemy health bar for the spelling / math boss battles. */
export function BossHealthBar({ name, current, max, art, tone = 'danger' }: BossHealthBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const defeated = current <= 0
  const gradient =
    tone === 'gold'
      ? 'from-amber-300 via-orange-500 to-red-600'
      : 'from-rose-400 via-red-500 to-red-700'

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl leading-none" aria-hidden>
            {art ?? '👾'}
          </span>
          <span className="font-display text-lg text-white text-outline">{name}</span>
        </div>
        <span className="chip border-rose-400/30 bg-rose-500/10 text-rose-200">
          <Heart size={14} aria-hidden />
          {Math.max(0, current)} / {max}
        </span>
      </div>
      <div
        className="h-6 w-full overflow-hidden rounded-full border border-white/15 bg-black/50"
        role="progressbar"
        aria-label={`${name} health`}
        aria-valuenow={Math.max(0, current)}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} ${
            defeated ? '' : 'shadow-[0_0_18px_rgba(244,63,94,0.6)]'
          }`}
          initial={false}
          animate={{ width: `${defeated ? 0 : pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  )
}
