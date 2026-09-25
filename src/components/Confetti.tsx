import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useAnimations } from '../hooks/useAnimations'

const COLORS = ['#22d3ee', '#a3e635', '#fbbf24', '#f472b6', '#818cf8', '#fb923c']

interface ConfettiProps {
  count?: number
  /** Bumping this value re-triggers the burst. */
  trigger?: number
}

/** Lightweight, dependency-free confetti burst. */
export function Confetti({ count = 40, trigger = 0 }: ConfettiProps) {
  const animate = useAnimations()
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.6 + Math.random() * 1.4,
        color: COLORS[i % COLORS.length],
        size: 8 + Math.random() * 10,
        rotate: Math.random() * 360,
        drift: (Math.random() - 0.5) * 160,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, trigger],
  )

  if (!animate) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={`${p.id}-${trigger}`}
          className="absolute top-[-5%] block rounded-sm"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 1.6, backgroundColor: p.color }}
          initial={{ y: '-10vh', opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', x: p.drift, rotate: p.rotate + 540, opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}
