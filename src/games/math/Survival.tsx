import { useMemo, useState } from 'react'
import { Heart, Swords } from 'lucide-react'
import type { MathGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { ChoiceGrid } from '../../components/ChoiceGrid'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { useGame } from '../../context/GameContext'
import { distractors, generateProblem, type MathProblem } from '../../utils/math'
import { pick, shuffle } from '../../utils/random'

const START_HEARTS = 3

/**
 * SURVIVAL MODE - answer as many as you can. No timer; three friendly hearts.
 */
export function Survival({ topics, difficulty, onExit }: MathGameProps) {
  const { recordMathAttempt, recordSession, buzz } = useGame()
  const score = useRound()

  const [seed, setSeed] = useState(0)
  const [problem, setProblem] = useState<MathProblem>(() =>
    generateProblem(pick(topics.length ? topics : ['mixed' as const]), difficulty),
  )
  const [hearts, setHearts] = useState(START_HEARTS)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [chosen, setChosen] = useState<string | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)

  const options = useMemo(() => {
    const opts = [problem.answer, ...distractors(problem, 3)].map(String)
    return shuffle(opts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, seed])

  function nextProblem() {
    const topic = pick(topics.length ? topics : ['mixed' as const])
    setProblem(generateProblem(topic, difficulty))
  }

  function select(option: string) {
    if (state || done) return
    const ok = Number(option) === problem.answer
    setChosen(option)
    setState(ok ? 'correct' : 'incorrect')
    score.answer(ok)
    const reward = recordMathAttempt(problem.category, ok)
    setGains((g) => ({ xp: g.xp + reward.xpGained, coins: g.coins + reward.coinsGained }))
    buzz(ok ? 'correct' : 'incorrect')
    setAnswered((a) => a + 1)

    const nextHearts = ok ? hearts : hearts - 1
    if (!ok) setHearts(nextHearts)

    window.setTimeout(() => {
      setChosen(null)
      setState(null)
      if (nextHearts <= 0) {
        const sessionReward = recordSession({
          kind: 'math',
          mode: 'Survival',
          correct: score.correct + (ok ? 1 : 0),
          total: score.total + 1,
          bestCombo: score.bestCombo,
        })
        setGains((g) => ({ xp: g.xp + sessionReward.xpGained, coins: g.coins + sessionReward.coinsGained }))
        setDone(true)
      } else {
        nextProblem()
      }
    }, ok ? 700 : 1400)
  }

  function replay() {
    score.reset()
    setSeed((s) => s + 1)
    setHearts(START_HEARTS)
    setState(null)
    setChosen(null)
    setGains({ xp: 0, coins: 0 })
    setAnswered(0)
    setDone(false)
    nextProblem()
  }

  return (
    <GameShell
      title="Survival Mode"
      subtitle="No timer - take your time and keep going"
      icon={<Swords size={22} aria-hidden />}
      onExit={onExit}
      correct={score.correct}
      total={answered}
      comboLabel={score.comboLabel}
    >
      {done ? (
        <RoundSummary
          title="GREAT RUN!"
          correct={score.correct}
          total={answered}
          xpGained={gains.xp}
          coinsGained={gains.coins}
          onReplay={replay}
          onExit={onExit}
          extra="You kept going like a champion!"
        />
      ) : (
        <>
          <div className="flex justify-center gap-1" aria-label={`${hearts} of ${START_HEARTS} hearts left`}>
            {Array.from({ length: START_HEARTS }).map((_, i) => (
              <Heart
                key={i}
                size={26}
                className={i < hearts ? 'text-rose-400' : 'text-white/20'}
                fill={i < hearts ? 'currentColor' : 'none'}
                aria-hidden
              />
            ))}
          </div>
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
          <AnswerFeedback state={state} />
        </>
      )}
    </GameShell>
  )
}
