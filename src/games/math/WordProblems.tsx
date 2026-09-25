import { useMemo, useState } from 'react'
import { BookText } from 'lucide-react'
import type { MathGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { AnswerInput } from '../../components/AnswerInput'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { useGame } from '../../context/GameContext'
import { wordProblem, type MathProblem } from '../../utils/math'

const TOTAL = 8

/** Age-appropriate 3rd grade story problems with typed numeric answers. */
export function WordProblems({ difficulty, onExit }: MathGameProps) {
  const { recordMathAttempt, recordSession, buzz } = useGame()
  const score = useRound()

  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)

  const problems = useMemo<MathProblem[]>(
    () => Array.from({ length: TOTAL }, () => wordProblem(difficulty)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [difficulty, seed],
  )
  const problem = problems[index]

  function handleSubmit(value: string) {
    if (!problem || state === 'correct') return
    const ok = Number(value) === problem.answer
    setState(ok ? 'correct' : 'incorrect')
    score.answer(ok)
    const reward = recordMathAttempt('wordProblems', ok)
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
          mode: 'Word Problems',
          correct: nextCorrect,
          total: nextTotal,
        })
        setGains((g) => ({ xp: g.xp + sessionReward.xpGained, coins: g.coins + sessionReward.coinsGained }))
        setDone(true)
      } else {
        setIndex((i) => i + 1)
      }
    }, ok ? 900 : 1700)
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
      title="Word Problems"
      subtitle={`Problem ${index + 1} of ${problems.length}`}
      icon={<BookText size={22} aria-hidden />}
      onExit={onExit}
      correct={score.correct}
      total={answered}
      comboLabel={score.comboLabel}
    >
      {done ? (
        <RoundSummary correct={score.correct} total={answered} xpGained={gains.xp} coinsGained={gains.coins} onReplay={replay} onExit={onExit} />
      ) : (
        <>
          <p className="rounded-2xl border border-white/10 bg-black/30 p-5 text-center font-display text-2xl leading-snug text-white sm:text-3xl">
            {problem.story}
          </p>
          <AnswerInput
            onSubmit={handleSubmit}
            disabled={state === 'correct'}
            resetKey={index}
            placeholder="Type the number"
            autoFocus
          />
          {state === 'incorrect' && (
            <p className="text-center font-display text-2xl text-electric-gold">Answer: {problem.answer}</p>
          )}
          <AnswerFeedback state={state} />
        </>
      )}
    </GameShell>
  )
}
