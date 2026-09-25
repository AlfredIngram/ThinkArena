import { useCallback, useMemo, useRef, useState } from 'react'
import { useGame } from '../context/GameContext'
import { buildPracticeRound } from '../services/adaptiveLearning'

/**
 * Builds an adaptively-weighted practice round for the weekly spelling list.
 * Weighting uses the player's stored per-word stats so weak words repeat more.
 * A new round is only built on replay, keeping question order stable mid-round.
 */
export function usePracticeWords(words: string[], count: number) {
  const { progress } = useGame()
  const [roundKey, setRoundKey] = useState(0)

  const statsRef = useRef(progress.spelling)
  statsRef.current = progress.spelling

  const key = words.join('|')
  const round = useMemo(
    () => buildPracticeRound(words, statsRef.current, count),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, count, roundKey],
  )

  const nextRound = useCallback(() => setRoundKey((k) => k + 1), [])

  return { round, nextRound }
}
