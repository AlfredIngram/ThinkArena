import { motion } from 'framer-motion'
import { Coins, RefreshCw, Sparkles, Star } from 'lucide-react'
import { Confetti } from './Confetti'

interface RoundSummaryProps {
  title?: string
  correct: number
  total: number
  xpGained: number
  coinsGained: number
  onReplay: () => void
  onExit: () => void
  extra?: string
}

/** End-of-round results card shown by every game mode. */
export function RoundSummary({
  title = 'ROUND COMPLETE!',
  correct,
  total,
  xpGained,
  coinsGained,
  onReplay,
  onExit,
  extra,
}: RoundSummaryProps) {
  const perfect = total > 0 && correct === total
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <div className="relative flex flex-col items-center gap-4 py-4 text-center">
      <Confetti trigger={correct + total} count={perfect ? 60 : 24} />
      <motion.h3
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="font-display text-3xl text-white sm:text-4xl"
      >
        {perfect ? 'PERFECT ROUND!' : title}
      </motion.h3>
      <p className="font-display text-6xl text-electric-cyan">{pct}%</p>
      <p className="text-white/80">
        You answered <span className="font-bold text-lime-300">{correct}</span> of {total} correctly.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <span className="chip border-cyan-400/40 bg-cyan-500/15 text-cyan-100">
          <Star size={16} aria-hidden /> +{xpGained} XP
        </span>
        <span className="chip border-amber-400/40 bg-amber-500/15 text-amber-100">
          <Coins size={16} aria-hidden /> +{coinsGained} coins
        </span>
        {perfect && (
          <span className="chip border-lime-400/40 bg-lime-500/15 text-lime-100">
            <Sparkles size={16} aria-hidden /> Perfect bonus
          </span>
        )}
      </div>

      {extra && <p className="text-sm font-bold text-electric-gold">{extra}</p>}

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button className="btn-primary" onClick={onReplay}>
          <RefreshCw size={18} aria-hidden /> Play Again
        </button>
        <button className="btn-ghost" onClick={onExit}>
          Choose another mode
        </button>
      </div>
    </div>
  )
}
