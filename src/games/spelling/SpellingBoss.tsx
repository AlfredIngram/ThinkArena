import { useMemo, useState } from 'react'
import { Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import type { SpellingGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { ChoiceGrid } from '../../components/ChoiceGrid'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { BossHealthBar } from '../../components/BossHealthBar'
import { Creature, CREATURES } from '../../components/Creature'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { usePracticeWords } from '../../hooks/usePracticeWords'
import { useGame } from '../../context/GameContext'
import { spellingOptions } from '../../utils/spelling'

const BOSS_HP = 14
const POOL = 30

/** Mode 8 - SPELLING BOSS BATTLE. Each correct answer damages the boss. */
export function SpellingBoss({ words, onExit }: SpellingGameProps) {
  const { recordSpellingAttempt, recordSession, buzz } = useGame()
  const { round, nextRound } = usePracticeWords(words, POOL)
  const score = useRound()

  const [hp, setHp] = useState(BOSS_HP)
  const [index, setIndex] = useState(0)
  const [seed, setSeed] = useState(0)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [chosen, setChosen] = useState<string | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })
  const [done, setDone] = useState(false)
  const [defeated, setDefeated] = useState(false)
  const [answered, setAnswered] = useState(0)

  const word = round[index % Math.max(1, round.length)] ?? ''
  const options = useMemo(
    () => (word ? spellingOptions(word, 4) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word, seed],
  )

  function select(option: string) {
    if (!word || state || done) return
    const ok = option.toLowerCase() === word.toLowerCase()
    setChosen(option)
    setState(ok ? 'correct' : 'incorrect')
    score.answer(ok)
    const reward = recordSpellingAttempt(word, ok)
    setGains((g) => ({ xp: g.xp + reward.xpGained, coins: g.coins + reward.coinsGained }))
    setAnswered((a) => a + 1)

    if (ok) {
      buzz('correct')
      const nextHp = Math.max(0, hp - 1)
      setHp(nextHp)
      if (nextHp === 0) {
        buzz('bossDefeated')
        window.setTimeout(() => {
          const sessionReward = recordSession({
            kind: 'spelling',
            mode: 'Spelling Boss',
            correct: score.correct + 1,
            total: score.total + 1,
            bestCombo: score.bestCombo,
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
      setIndex((i) => i + 1)
    }, ok ? 700 : 1300)
  }

  function replay() {
    nextRound()
    score.reset()
    setHp(BOSS_HP)
    setIndex(0)
    setSeed((s) => s + 1)
    setState(null)
    setChosen(null)
    setGains({ xp: 0, coins: 0 })
    setAnswered(0)
    setDefeated(false)
    setDone(false)
  }

  if (!word) {
    return (
      <GameShell title="Spelling Boss Battle" onExit={onExit}>
        <p className="text-center text-white/70">Add spelling words in Parent Mode to start this quest.</p>
      </GameShell>
    )
  }

  const hpPercent = (hp / BOSS_HP) * 100

  return (
    <GameShell
      title="SPELLING BOSS BATTLE"
      subtitle={`${CREATURES.glitchDragon.name} blocks your path!`}
      icon={<Crown size={22} aria-hidden />}
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
          extra={defeated ? 'The path is clear. Amazing work!' : 'The boss escaped - try again to finish it off!'}
        />
      ) : (
        <>
          <div className="flex flex-col items-center">
            <Creature spec={CREATURES.glitchDragon} hpPercent={hpPercent} />
            <div className="w-full max-w-xl">
              <BossHealthBar name={CREATURES.glitchDragon.name} current={hp} max={BOSS_HP} art="🐲" />
            </div>
          </div>

          <motion.p key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center font-display text-xl text-white">
            Spell the word to attack!
          </motion.p>

          <ChoiceGrid
            options={options}
            onSelect={select}
            disabled={state !== null}
            correctValue={state ? word : null}
            chosen={chosen}
          />
          <AnswerFeedback state={state} />
        </>
      )}
    </GameShell>
  )
}
