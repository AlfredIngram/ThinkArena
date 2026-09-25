import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, RotateCcw } from 'lucide-react'

const PRAISE = ['AWESOME!', 'NICE JOB!', 'YOU GOT IT!', 'GREAT WORK!', 'AMAZING!', 'KEEP GOING!']

export function randomPraise(): string {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)]
}

interface AnswerFeedbackProps {
  /** null = hidden */
  state: 'correct' | 'incorrect' | null
  xp?: number
  message?: string
  /** Only shown on incorrect to offer another try. */
  onRetry?: () => void
}

/**
 * Big, encouraging feedback banner. Correct/incorrect is conveyed with an icon
 * and text as well as colour, for accessibility.
 */
export function AnswerFeedback({ state, xp, message, onRetry }: AnswerFeedbackProps) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex flex-col items-center gap-2"
          role="status"
          aria-live="polite"
        >
          {state === 'correct' ? (
            <div className="flex items-center gap-2 rounded-full border border-lime-400/50 bg-lime-500/20 px-5 py-2 text-lime-100">
              <CheckCircle2 size={24} aria-hidden />
              <span className="font-display text-2xl">{message ?? randomPraise()}</span>
              {typeof xp === 'number' && xp > 0 && <span className="font-display text-xl text-amber-200">+{xp} XP</span>}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-orange-400/50 bg-orange-500/20 px-5 py-2 text-orange-100">
                <RotateCcw size={22} aria-hidden />
                <span className="font-display text-2xl">NOT QUITE</span>
              </div>
              <p className="text-sm font-bold text-white/80">TRY AGAIN! YOU CAN DO IT!</p>
              {onRetry && (
                <button className="btn-ghost text-base" onClick={onRetry}>
                  Try again
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
