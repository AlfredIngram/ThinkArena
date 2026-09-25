import { CheckCircle2, Circle } from 'lucide-react'
import type { MissionDef } from '../types'
import { motion } from 'framer-motion'

interface MissionCardProps {
  mission: MissionDef
  value: number
  complete: boolean
}

/** One daily mission with progress dots. */
export function MissionCard({ mission, value, complete }: MissionCardProps) {
  const pct = Math.min(100, Math.round((value / mission.target) * 100))

  return (
    <div
      className={`rounded-2xl border p-3 transition-colors ${
        complete ? 'border-lime-400/50 bg-lime-400/10' : 'border-white/10 bg-white/[0.04]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {complete ? (
            <CheckCircle2 className="text-lime-400" size={22} aria-hidden />
          ) : (
            <Circle className="text-white/30" size={22} aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-white">{mission.title}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/40">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500"
                initial={false}
                animate={{ width: `${pct}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-bold text-white/70">
              {Math.min(value, mission.target)}/{mission.target}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-bold text-cyan-200/80">
            +{mission.xp} XP · +{mission.coins} coins
          </p>
        </div>
      </div>
    </div>
  )
}
