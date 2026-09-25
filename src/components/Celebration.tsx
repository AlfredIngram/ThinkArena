import { AnimatePresence, motion } from 'framer-motion'
import { PartyPopper } from 'lucide-react'
import { useGame } from '../context/GameContext'
import { Confetti } from './Confetti'

/** Full-screen LEVEL UP! celebration overlay. */
export function Celebration() {
  const { celebration, dismissCelebration } = useGame()

  return (
    <AnimatePresence>
      {celebration && (
        <motion.button
          type="button"
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissCelebration}
          aria-label="Level up! Tap to continue"
        >
          <Confetti trigger={celebration.level} count={70} />
          <motion.div
            className="relative z-10 flex flex-col items-center gap-3 text-center"
            initial={{ scale: 0.6, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14 }}
          >
            <PartyPopper className="text-electric-gold" size={64} aria-hidden />
            <h2 className="font-display text-5xl text-white text-outline sm:text-6xl">LEVEL UP!</h2>
            <p className="font-display text-2xl text-cyan-200">You reached Level {celebration.level}</p>
            <p className="text-sm text-white/70">Tap anywhere to keep playing</p>
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
