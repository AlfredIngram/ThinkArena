import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'
import { useGame } from '../context/GameContext'

/** Coin balance chip. */
export function CoinCounter({ className = '' }: { className?: string }) {
  const { progress } = useGame()
  return (
    <div className={`chip border-amber-300/30 bg-amber-400/10 text-amber-200 ${className}`} aria-label={`${progress.coins} coins`}>
      <motion.span key={progress.coins} initial={{ scale: 1.35 }} animate={{ scale: 1 }}>
        <Coins size={18} aria-hidden />
      </motion.span>
      <span className="font-display text-base">{progress.coins.toLocaleString()}</span>
    </div>
  )
}
