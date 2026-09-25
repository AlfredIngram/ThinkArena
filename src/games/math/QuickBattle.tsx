import { useMemo, useState } from 'react'
import { Swords } from 'lucide-react'
import type { MathGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { ChoiceGrid } from '../../components/ChoiceGrid'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { useGame } from '../../context/GameContext'
import { distractors, generateRun, type MathProblem } from '../../utils/math'
import { shuffle } from '../../utils/random'

const TOTAL = 10

function optionsFor(problem: MathProblem): string[] {
  const opts = [problem.answer, ...distractors(problem, 3)].map(String)
  return shuffle(opts)
}

/** 10 questions, each correct answer damages an enemy. */
export function QuickBattle({ topics, difficulty, onExit }: MathGameProps) {
  const { recordMathAttempt, recordSession, buzz } = useGame()
  const score = useRound()

  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [chosen, setChosen] = useState<string | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)

  const problems = useMemo(
    () => generateRun(topics, difficulty, TOTAL),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topics.join('|'), difficulty, seed],
  )
  const problem = problems[index]
  const options = useMemo(() => (problem ? optionsFor(problem) : []), [problem, seed])

  function select(option: string) {
    if (!problem || state || done) return
    const ok = Number(option) === problem.answer
    setChosen(option)
    setState(ok ? 'correct' : 'incorrect')
    score.answer(ok)
    const reward = recordMathAttempt(problem.category, ok)
    setGains((g) => ({ xp: g.xp + reward.xpGained, coins: g.coins + reward.coinsGained }))
    buzz(ok ? 'correct' : 'incorrect')

    const nextCorrect = score.correct + (ok ? 1 : 0)
    const nextTotal = score.total + 1
    setAnswered(nextTotal)

    window.setTimeout(() => {
      setChosen(null)
      setState(null)
      if (index + 1 >= problems.length) {
        const sessionReward = recordSession({
          kind: 'math',
          mode: 'Quick Battle',
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
    score.reset()
    setSeed((s) => s + 1)
    setIndex(0)
    setState(null)
    setChosen(null)
    setGains({ xp: 0, coins: 0 })
    setAnswered(0)
    setDone(false)
  }

  if (!problem) {
    return (
      <GameShell title="Quick Battle" onExit={onExit}>
        <p className="text-center text-white/70">Turn on at least one math topic in Parent Mode.</p>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Quick Battle"
      subtitle={`Enemy ${index + 1} of ${problems.length}`}
      icon={<Swords size={22} aria-hidden />}
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
          <ChoiceGrid
            options={options}
            onSelect={select}
            disabled={state !== null}
            correctValue={state ? String(problem.answer) : null}
            chosen={chosen}
          />
          <AnswerFeedback state={state} xp={10} />
        </>
      )}
    </GameShell>
  )
}
