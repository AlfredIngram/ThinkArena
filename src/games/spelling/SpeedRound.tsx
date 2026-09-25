import { useEffect, useMemo, useRef, useState } from 'react'
import { Timer } from 'lucide-react'
import type { SpellingGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { ChoiceGrid } from '../../components/ChoiceGrid'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { usePracticeWords } from '../../hooks/usePracticeWords'
import { useGame } from '../../context/GameContext'
import { spellingOptions } from '../../utils/spelling'

const DURATION = 60
const SPEED_BONUS_XP = 5

/** Mode 7 - 60-second speed round with bonus XP per correct answer. */
export function SpeedRound({ words, onExit }: SpellingGameProps) {
  const { recordSpellingAttempt, recordSession, awardBonus, buzz } = useGame()
  const { round, nextRound } = usePracticeWords(words, 40)
  const score = useRound()

  const [timeLeft, setTimeLeft] = useState(DURATION)
  const [index, setIndex] = useState(0)
  const [seed, setSeed] = useState(0)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [chosen, setChosen] = useState<string | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)

  const finishedRef = useRef(false)
  const word = round[index % Math.max(1, round.length)] ?? ''

  const options = useMemo(
    () => (word ? spellingOptions(word, 4) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word, seed],
  )

  useEffect(() => {
    if (done) return
    const t = window.setInterval(() => {
      setTimeLeft((v) => {
        if (v <= 1) {
          window.clearInterval(t)
          finish()
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  function finish(finalCorrect?: number, finalTotal?: number) {
    if (finishedRef.current) return
    finishedRef.current = true
    const correct = finalCorrect ?? score.correct
    const total = finalTotal ?? score.total
    // Speed bonus: extra XP for every correct answer in the minute.
    if (correct > 0) {
      const bonus = awardBonus(correct * SPEED_BONUS_XP, correct * 2)
      setGains((g) => ({ xp: g.xp + bonus.xpGained, coins: g.coins + bonus.coinsGained }))
    }
    const sessionReward = recordSession({
      kind: 'spelling',
      mode: 'Speed Round',
      correct,
      total,
      bestCombo: score.bestCombo,
    })
    setGains((g) => ({ xp: g.xp + sessionReward.xpGained, coins: g.coins + sessionReward.coinsGained }))
    setDone(true)
  }

  function select(option: string) {
    if (!word || state || done) return
    const ok = option.toLowerCase() === word.toLowerCase()
    setChosen(option)
    setState(ok ? 'correct' : 'incorrect')
    score.answer(ok)
    const reward = recordSpellingAttempt(word, ok)
    setGains((g) => ({ xp: g.xp + reward.xpGained, coins: g.coins + reward.coinsGained }))
    buzz(ok ? 'correct' : 'incorrect')
    setAnswered((a) => a + 1)

    window.setTimeout(() => {
      setChosen(null)
      setState(null)
      setIndex((i) => i + 1)
    }, ok ? 350 : 700)
  }

  function replay() {
    finishedRef.current = false
    nextRound()
    score.reset()
    setTimeLeft(DURATION)
    setIndex(0)
    setSeed((s) => s + 1)
    setState(null)
    setChosen(null)
    setGains({ xp: 0, coins: 0 })
    setAnswered(0)
    setDone(false)
  }

  if (!word) {
    return (
      <GameShell title="Speed Round" onExit={onExit}>
        <p className="text-center text-white/70">Add spelling words in Parent Mode to start this quest.</p>
      </GameShell>
    )
  }

  const pct = (timeLeft / DURATION) * 100

  return (
    <GameShell
      title="Speed Round"
      subtitle="60 seconds - how many can you nail?"
      icon={<Timer size={22} aria-hidden />}
      onExit={onExit}
      correct={score.correct}
      total={answered}
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
          extra={`Speed bonus: +${score.correct * SPEED_BONUS_XP} XP`}
        />
      ) : (
        <>
          <div>
            <div className="mb-1 flex justify-between font-display text-xl text-white">
              <span aria-label={`${timeLeft} seconds left`}>⏱ {timeLeft}s</span>
              <span className="text-electric-cyan">Answered: {answered}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-black/40">
              <div
                className={`h-full rounded-full ${timeLeft <= 10 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-electric-cyan to-electric-blue'}`}
                style={{ width: `${pct}%`, transition: 'width 1s linear' }}
              />
            </div>
          </div>
          <p className="text-center text-sm text-white/60">Which one is spelled correctly?</p>
          <ChoiceGrid
            options={options}
            onSelect={select}
            disabled={state !== null}
            correctValue={state ? word : null}
            chosen={chosen}
            columns={2}
          />
        </>
      )}
    </GameShell>
  )
}
