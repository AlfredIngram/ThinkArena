import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import type { SpellingGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { AnswerInput } from '../../components/AnswerInput'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { usePracticeWords } from '../../hooks/usePracticeWords'
import { useGame } from '../../context/GameContext'

const TOTAL = 8
const VIEW_MS = 3000

/** Mode 4 - see the word, then type it from memory. */
export function TypeWord({ words, onExit }: SpellingGameProps) {
  const { recordSpellingAttempt, recordSession, buzz } = useGame()
  const { round, nextRound } = usePracticeWords(words, TOTAL)
  const score = useRound()

  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(true)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })

  const word = round[index] ?? ''

  useEffect(() => {
    setRevealed(true)
    setState(null)
    const t = window.setTimeout(() => setRevealed(false), VIEW_MS)
    return () => window.clearTimeout(t)
  }, [index, round])

  function handleSubmit(value: string) {
    if (!word || state === 'correct') return
    const ok = value.trim().toLowerCase() === word.toLowerCase()
    setState(ok ? 'correct' : 'incorrect')
    score.answer(ok)
    const reward = recordSpellingAttempt(word, ok)
    setGains((g) => ({ xp: g.xp + reward.xpGained, coins: g.coins + reward.coinsGained }))
    buzz(ok ? 'correct' : 'incorrect')

    const nextCorrect = score.correct + (ok ? 1 : 0)
    const nextTotal = score.total + 1
    setAnswered(nextTotal)

    window.setTimeout(() => {
      if (index + 1 >= round.length) {
        const sessionReward = recordSession({
          kind: 'spelling',
          mode: 'Type the Word',
          correct: nextCorrect,
          total: nextTotal,
        })
        setGains((g) => ({ xp: g.xp + sessionReward.xpGained, coins: g.coins + sessionReward.coinsGained }))
        setDone(true)
      } else {
        setIndex((i) => i + 1)
      }
    }, ok ? 800 : 1600)
  }

  function replay() {
    nextRound()
    score.reset()
    setIndex(0)
    setDone(false)
    setState(null)
    setRevealed(true)
  }

  if (!word) {
    return (
      <GameShell title="Type the Word" onExit={onExit}>
        <p className="text-center text-white/70">Add spelling words in Parent Mode to start this quest.</p>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Type the Word"
      subtitle="Memorize it, then type it"
      icon={<Eye size={22} aria-hidden />}
      onExit={onExit}
      correct={score.correct}
      total={score.total}
      comboLabel={score.comboLabel}
    >
      {done ? (
        <RoundSummary
          correct={score.correct}
          total={answered}
          xpGained={gains.xp}
          coinsGained={gains.coins}
          onReplay={replay}
          onExit={onExit}
        />
      ) : (
        <>
          <div className="grid min-h-[120px] place-items-center rounded-2xl border border-white/10 bg-black/30 p-4">
            {revealed ? (
              <p className="font-display text-5xl tracking-wide text-electric-cyan">{word.toUpperCase()}</p>
            ) : (
              <p className="font-display text-3xl text-white/40">Now type it from memory</p>
            )}
          </div>
          {!revealed && (
            <AnswerInput onSubmit={handleSubmit} disabled={state === 'correct'} resetKey={index} autoFocus />
          )}
          {!revealed && state === 'incorrect' && (
            <p className="text-center font-display text-2xl text-electric-gold">{word.toUpperCase()}</p>
          )}
          <AnswerFeedback state={state} />
        </>
      )}
    </GameShell>
  )
}
