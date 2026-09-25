import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useAnimations } from '../hooks/useAnimations'

interface GameCardProps {
  children: ReactNode
  className?: string
  /** Adds a hover lift + glow. */
  interactive?: boolean
  onClick?: () => void
  ariaLabel?: string
}

/** Base rounded, glowing panel used across the whole app. */
export function GameCard({ children, className = '', interactive, onClick, ariaLabel }: GameCardProps) {
  const animate = useAnimations()
  const interactiveProps = interactive
    ? {
        whileHover: animate ? { y: -6, scale: 1.01 } : undefined,
        whileTap: animate ? { scale: 0.99 } : undefined,
        role: 'button' as const,
        tabIndex: 0,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick()
          }
        },
      }
    : {}

  return (
    <motion.div
      className={`game-card ${interactive ? 'cursor-pointer hover:border-electric-cyan/40' : ''} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      {...interactiveProps}
    >
      {children}
    </motion.div>
  )
}
