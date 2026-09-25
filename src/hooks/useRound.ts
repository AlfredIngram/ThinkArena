import { useCallback, useMemo, useState } from 'react'

/**
 * Shared scoring state for every game mode: correct/total, current combo,
 * and the best combo of the round. Purely local UI state - persistence happens
 * through the game context.
 */
export function useRound() {
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [streak, setStreak] = useState(0) // consecutive correct, resets on miss

  const answer = useCallback((ok: boolean) => {
    setTotal((t) => t + 1)
    if (ok) {
      setCorrect((c) => c + 1)
      setStreak((s) => {
        const next = s + 1
        setBestCombo((b) => Math.max(b, next))
        return next
      })
      setCombo((c) => c + 1)
    } else {
      setStreak(0)
      setCombo(0)
    }
  }, [])

  const reset = useCallback(() => {
    setCorrect(0)
    setTotal(0)
    setCombo(0)
    setBestCombo(0)
    setStreak(0)
  }, [])

  const comboLabel = useMemo(() => {
    if (streak >= 10) return 'UNSTOPPABLE'
    if (streak >= 5) return 'SUPER COMBO'
    if (streak >= 3) return 'COMBO x2'
    return null
  }, [streak])

  return { correct, total, combo, streak, bestCombo, comboLabel, answer, reset }
}
