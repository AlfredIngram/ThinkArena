import { useMemo, useState } from 'react'
import { Skull } from 'lucide-react'
import type { MathGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { ChoiceGrid } from '../../components/ChoiceGrid'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { BossHealthBar } from '../../components/BossHealthBar'
import { Creature, CREATURES } from '../../components/Creature'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { useGame } from '../../context/GameContext'
import { distractors, generateProblem, type MathProblem } from '../../utils/math'
import { pick, shuffle } from '../../utils/random'

const BOSS_HP = 12

/** MATH BOSS - big enemy health bar, combos deal extra damage. */
export function MathBoss({ topics, difficulty, onExit }: MathGameProps) {
  const { recordMathAttempt, recordSession, buzz } = useGame()
  const score = useRound()

  const [seed, setSeed] = useState(0)
  const [problem, setProblem] = useState<MathProblem>(() =>
    generateProblem(pick(topics.length ? topics : ['mixed' as const]), difficulty),
  )
  const [hp, setHp] = useState(BOSS_HP)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [chosen, setChosen] = useState<string | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })
  const [done, setDone] = useState(false)
  const [defeated, setDefeated] = useState(false)
  const [answered, setAnswered] = useState(0)
  const [lastHit, setLastHit] = useState(1)

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
    setAnswered((a) => a + 1)

    if (ok) {
      buzz('correct')
      // Combos deal extra damage: 3+ in a row = 2 damage, 5+ = 3 damage.
      const damage = score.streak >= 5 ? 3 : score.streak >= 3 ? 2 : 1
      setLastHit(damage)
      const nextHp = Math.max(0, hp - damage)
      setHp(nextHp)
      if (nextHp === 0) {
        buzz('bossDefeated')
        window.setTimeout(() => {
          const sessionReward = recordSession({
            kind: 'math',
            mode: 'Math Boss',
            correct: score.correct + 1,
            total: score.total + 1,
            bestCombo: Math.max(score.bestCombo, score.streak + 1),
            bossDefeated: true,
          })
          setGains((g) => ({ xp: g.xp + sessionReward.xpGained, coins: g.coins + sessionReward.coinsGained }))
          setDefeated(true)
          setDone(true)
        }, 700)
        return
      }
    } else {
      buzz('incorrect')
    }

    window.setTimeout(() => {
      setChosen(null)
      setState(null)
      nextProblem()
    }, ok ? 750 : 1400)
  }

  function replay() {
    score.reset()
    setSeed((s) => s + 1)
    setHp(BOSS_HP)
    setState(null)
    setChosen(null)
    setGains({ xp: 0, coins: 0 })
    setAnswered(0)
    setDefeated(false)
    setDone(false)
    nextProblem()
  }

  const hpPercent = (hp / BOSS_HP) * 100

  return (
    <GameShell
      title="MATH BOSS"
      subtitle="Answer correctly to attack!"
      icon={<Skull size={22} aria-hidden />}
      onExit={onExit}
      correct={score.correct}
      total={answered}
      comboLabel={score.comboLabel}
      wide
    >
      {done ? (
        <RoundSummary
          title={defeated ? 'BOSS DEFEATED!' : 'GOOD FIGHT!'}
          correct={score.correct}
          total={answered}
          xpGained={gains.xp}
          coinsGained={gains.coins}
          onReplay={replay}
          onExit={onExit}
          extra={defeated ? 'You crushed the Number Crusher!' : 'Try again to finish the job!'}
        />
      ) : (
        <>
          <div className="flex flex-col items-center">
            <Creature spec={CREATURES.numberCrusher} hpPercent={hpPercent} />
            <div className="w-full max-w-xl">
              <BossHealthBar
                name={CREATURES.numberCrusher.name}
                current={hp}
                max={BOSS_HP}
                art="👾"
                tone="gold"
              />
            </div>
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
          {state === 'correct' && (
            <p className="text-center font-display text-2xl text-electric-gold">
              {lastHit > 1 ? `SUPER HIT! -${lastHit} HP` : 'HIT! -1 HP'}
            </p>
          )}
          <AnswerFeedback state={state} />
        </>
      )}
    </GameShell>
  )
}
