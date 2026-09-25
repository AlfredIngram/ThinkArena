import type { RewardDef, StudentProfile } from '../types'
import { rewardById } from '../data/rewards'

interface AvatarCardProps {
  student: StudentProfile
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
}

const SIZES = {
  sm: { box: 'h-16 w-16', art: 'text-3xl' },
  md: { box: 'h-24 w-24', art: 'text-5xl' },
  lg: { box: 'h-36 w-36', art: 'text-7xl' },
}

function safeReward(id: string): RewardDef | undefined {
  return rewardById(id)
}

/** The student's profile character: avatar + background + frame + badge. */
export function AvatarCard({ student, size = 'md', showBadge = true }: AvatarCardProps) {
  const avatar = safeReward(student.avatarId)
  const background = safeReward(student.backgroundId)
  const frame = safeReward(student.frameId)
  const badge = student.badgeId ? safeReward(student.badgeId) : undefined
  const s = SIZES[size]

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative flex ${s.box} items-center justify-center overflow-hidden rounded-3xl border-4 ${
          frame?.id === 'frame-gold'
            ? 'border-amber-300 shadow-glowGold'
            : frame?.id === 'frame-neon'
              ? 'border-lime-300 shadow-[0_0_24px_rgba(163,230,53,0.5)]'
              : 'border-white/20'
        } bg-gradient-to-br ${background?.gradient ?? 'from-indigo-700 to-slate-900'}`}
        aria-label={`${student.name}'s avatar`}
      >
        <span className={`${s.art} drop-shadow-lg`} aria-hidden>
          {avatar?.art ?? '🚀'}
        </span>
        {showBadge && badge && (
          <span
            className="absolute -bottom-1 -right-1 rounded-full bg-arena-night/90 p-1 text-xl"
            title={badge.name}
            aria-label={badge.name}
          >
            {badge.art}
          </span>
        )}
      </div>
      <p className="font-display text-lg text-white">{student.name}</p>
    </div>
  )
}
