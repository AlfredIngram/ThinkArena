import { useMemo, useState } from 'react'
import { LetterText } from 'lucide-react'
import type { SpellingGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { AnswerInput } from '../../components/AnswerInput'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { usePracticeWords } from '../../hooks/usePracticeWords'
import { useGame } from '../../context/GameContext'
import { hideLetters } from '../../utils/spelling'

const TOTAL = 8

/** Mode 2 - fill in the missing letters (type the whole word). */
export function MissingLetters({ words, onExit }: SpellingGameProps) {
  const { recordSpellingAttempt, recordSession, buzz } = useGame()
  const { round, nextRound } = usePracticeWords(words, TOTAL)
  const score = useRound()

  const [index, setIndex] = useState(0)
  const [seed, setSeed] = useState(0)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })

  const word = round[index] ?? ''
  const { display } = useMemo(
    () => hideLetters(word, 0.4),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word, seed],
  )

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
      setState(null)
      if (index + 1 >= round.length) {
        const sessionReward = recordSession({
          kind: 'spelling',
          mode: 'Missing Letters',
          correct: nextCorrect,
          total: nextTotal,
        })
        setGains((g) => ({ xp: g.xp + sessionReward.xpGained, coins: g.coins + sessionReward.coinsGained }))
        setDone(true)
      } else {
        setIndex((i) => i + 1)
      }
    }, ok ? 800 : 1500)
  }

  function replay() {
    nextRound()
    score.reset()
    setIndex(0)
    setSeed((s) => s + 1)
    setDone(false)
    setState(null)
  }

  if (!word) {
    return (
      <GameShell title="Missing Letters" onExit={onExit}>
        <p className="text-center text-white/70">Add spelling words in Parent Mode to start this quest.</p>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Missing Letters"
      subtitle="Fill in the blanks and type the whole word"
      icon={<LetterText size={22} aria-hidden />}
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
          <p className="text-center font-display text-4xl tracking-[0.35em] text-electric-cyan sm:text-5xl">
            {display.toUpperCase()}
          </p>
          <p className="text-center text-sm text-white/60">
            Hint: the blanks are letters you need to fill in. Type the complete word.
          </p>
          <AnswerInput onSubmit={handleSubmit} disabled={state === 'correct'} resetKey={index} autoFocus />
          <AnswerFeedback state={state} />
        </>
      )}
    </GameShell>
  )
}
