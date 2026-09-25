import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Flame, Target } from 'lucide-react'

interface GameShellProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  onExit: () => void
  correct?: number
  total?: number
  comboLabel?: string | null
  children: ReactNode
  /** Sticky footer area for primary actions. */
  footer?: ReactNode
  wide?: boolean
}

/**
 * Shared frame for every activity: back button, live score, combo banner.
 * Keeps individual game modes focused on their own puzzle mechanics.
 */
export function GameShell({
  title,
  subtitle,
  icon,
  onExit,
  correct,
  total,
  comboLabel,
  children,
  footer,
  wide,
}: GameShellProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`game-panel tile-grid mx-auto w-full ${wide ? 'max-w-4xl' : 'max-w-2xl'} p-4 sm:p-6`}
      aria-label={title}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <button className="btn-ghost px-3 text-base" onClick={onExit} aria-label="Back to mode select">
          <ArrowLeft size={18} aria-hidden /> Back
        </button>

        <div className="min-w-0 flex-1 text-center">
          <h2 className="flex items-center justify-center gap-2 font-display text-xl text-white sm:text-2xl">
            {icon}
            <span className="truncate">{title}</span>
          </h2>
          {subtitle && <p className="truncate text-xs text-white/60">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {typeof correct === 'number' && typeof total === 'number' && (
            <span className="chip border-cyan-400/30 bg-cyan-500/10 text-cyan-100" aria-label={`${correct} correct of ${total}`}>
              <Target size={14} aria-hidden />
              {correct}/{total}
            </span>
          )}
        </div>
      </div>

      {comboLabel && (
        <motion.div
          key={comboLabel}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-4 flex justify-center"
        >
          <span className="chip border-orange-400/50 bg-orange-500/20 font-display text-base text-orange-100">
            <Flame size={16} aria-hidden />
            {comboLabel}
          </span>
        </motion.div>
      )}

      <div className="space-y-5">{children}</div>

      {footer && <div className="mt-6 flex justify-center gap-3">{footer}</div>}
    </motion.section>
  )
}
