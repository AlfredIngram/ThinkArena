import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../context/GameContext'

const TONE_STYLES: Record<string, string> = {
  xp: 'border-cyan-400/40 bg-cyan-500/20 text-cyan-100',
  coin: 'border-amber-400/40 bg-amber-500/20 text-amber-100',
  success: 'border-lime-400/40 bg-lime-500/20 text-lime-100',
  info: 'border-white/20 bg-white/10 text-white',
  achievement: 'border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-100',
}

/** Floating feedback toasts (+10 XP, mission complete, achievement, ...). */
export function Toaster() {
  const { toasts } = useGame()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex flex-col items-center gap-2 px-4 sm:bottom-8">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            className={`pointer-events-auto flex max-w-sm items-center gap-2 rounded-full border px-4 py-2 font-display text-lg shadow-lg backdrop-blur ${
              TONE_STYLES[t.tone] ?? TONE_STYLES.info
            }`}
            role="status"
          >
            {t.icon && <span aria-hidden>{t.icon}</span>}
            <span>{t.label}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
