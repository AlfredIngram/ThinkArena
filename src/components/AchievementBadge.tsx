import { Lock } from 'lucide-react'
import type { AchievementDef } from '../types'

const TIER_STYLES: Record<AchievementDef['tier'], string> = {
  bronze: 'from-amber-700/60 to-amber-900/60 border-amber-500/40',
  silver: 'from-slate-400/50 to-slate-700/60 border-slate-300/40',
  gold: 'from-amber-400/60 to-yellow-600/60 border-amber-300/60',
  legendary: 'from-fuchsia-500/60 to-indigo-600/60 border-fuchsia-300/60',
}

interface AchievementBadgeProps {
  achievement: AchievementDef
  unlocked: boolean
}

/** Trophy-room badge. Locked badges stay visible but dimmed. */
export function AchievementBadge({ achievement, unlocked }: AchievementBadgeProps) {
  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-br p-4 text-center transition-all ${
        unlocked ? TIER_STYLES[achievement.tier] : 'border-white/10 from-white/5 to-white/0 opacity-60'
      }`}
      aria-label={`${achievement.title} - ${unlocked ? 'unlocked' : 'locked'}`}
    >
      <div className="relative mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-black/40 text-3xl">
        <span aria-hidden className={unlocked ? '' : 'grayscale'}>
          {unlocked ? achievement.icon : <Lock size={24} className="text-white/60" />}
        </span>
      </div>
      <p className="font-display text-sm text-white">{achievement.title}</p>
      <p className="mt-1 text-[11px] leading-tight text-white/70">{achievement.description}</p>
      <span className="mt-2 inline-block rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/70">
        {achievement.tier}
      </span>
    </div>
  )
}
