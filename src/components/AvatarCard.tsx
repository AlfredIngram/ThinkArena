import type { StudentProfile } from '../types'
import { rewardById } from '../data/rewards'
import { Avatar } from './Avatar'

interface AvatarCardProps {
  student: StudentProfile
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
}

const SIZES = {
  sm: { box: 'h-16 w-16', px: 64 },
  md: { box: 'h-24 w-24', px: 96 },
  lg: { box: 'h-36 w-36', px: 144 },
}

const FALLBACK_WARDROBE = {
  base: 'base-round',
  skin: 'skin-peach',
  hair: 'hair-tuft',
  outfit: 'outfit-tee',
  accessory: 'accessory-none',
  pet: 'pet-none',
  aura: 'aura-none',
} as const

/** The student's profile character: layered avatar + background + frame + badge. */
export function AvatarCard({ student, size = 'md', showBadge = true }: AvatarCardProps) {
  const background = rewardById(student.backgroundId)
  const frame = rewardById(student.frameId)
  const badge = student.badgeId ? rewardById(student.badgeId) : undefined
  const s = SIZES[size]
  const equip = student.wardrobe ?? { ...FALLBACK_WARDROBE }

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
        <Avatar equip={equip} size={s.px} label={`${student.name}'s avatar`} />
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
