import { useMemo, useState } from 'react'
import { Layers } from 'lucide-react'
import type { MathGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { AnswerInput } from '../../components/AnswerInput'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { useGame } from '../../context/GameContext'
import { MATH_TOPIC_LABELS, generateRun } from '../../utils/math'

const TOTAL = 12

/** Mixed review across every enabled topic, typed answers. */
export function MixedReview({ topics, difficulty, onExit }: MathGameProps) {
  const { recordMathAttempt, recordSession, buzz } = useGame()
  const score = useRound()

  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)

  const problems = useMemo(
    () => generateRun(topics.length ? topics : ['mixed'], difficulty, TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topics.join('|'), difficulty, seed],
  )
  const problem = problems[index]

  function handleSubmit(value: string) {
    if (!problem || state === 'correct') return
    const ok = Number(value) === problem.answer
    setState(ok ? 'correct' : 'incorrect')
    score.answer(ok)
    const reward = recordMathAttempt(problem.category, ok)
    setGains((g) => ({ xp: g.xp + reward.xpGained, coins: g.coins + reward.coinsGained }))
    buzz(ok ? 'correct' : 'incorrect')

    const nextCorrect = score.correct + (ok ? 1 : 0)
    const nextTotal = score.total + 1
    setAnswered(nextTotal)

    window.setTimeout(() => {
      setState(null)
      if (index + 1 >= problems.length) {
        const sessionReward = recordSession({
          kind: 'math',
          mode: 'Mixed Review',
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
    score.reset()
    setSeed((s) => s + 1)
    setIndex(0)
    setState(null)
    setGains({ xp: 0, coins: 0 })
    setAnswered(0)
    setDone(false)
  }

  if (!problem) return null

  return (
    <GameShell
      title="Mixed Review"
      subtitle={`${MATH_TOPIC_LABELS[problem.category]} · ${index + 1} of ${problems.length}`}
      icon={<Layers size={22} aria-hidden />}
      onExit={onExit}
      correct={score.correct}
      total={answered}
      comboLabel={score.comboLabel}
    >
      {done ? (
        <RoundSummary correct={score.correct} total={answered} xpGained={gains.xp} coinsGained={gains.coins} onReplay={replay} onExit={onExit} />
      ) : (
        <>
          <div className="grid min-h-[120px] place-items-center rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-center font-display text-5xl text-white sm:text-6xl">{problem.question}</p>
          </div>
          <AnswerInput onSubmit={handleSubmit} disabled={state === 'correct'} resetKey={index} autoFocus />
          {state === 'incorrect' && (
            <p className="text-center font-display text-2xl text-electric-gold">Answer: {problem.answer}</p>
          )}
          <AnswerFeedback state={state} />
        </>
      )}
    </GameShell>
  )
}
