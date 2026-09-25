import { useMemo, useState } from 'react'
import { Shuffle, Delete } from 'lucide-react'
import { motion } from 'framer-motion'
import type { SpellingGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { usePracticeWords } from '../../hooks/usePracticeWords'
import { useGame } from '../../context/GameContext'
import { scramble } from '../../utils/spelling'

const TOTAL = 8

/** Mode 3 - unscramble the letters by tapping them in order. */
export function Unscramble({ words, onExit }: SpellingGameProps) {
  const { recordSpellingAttempt, recordSession, buzz } = useGame()
  const { round, nextRound } = usePracticeWords(words, TOTAL)
  const score = useRound()

  const [index, setIndex] = useState(0)
  const [seed, setSeed] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })

  const word = round[index] ?? ''
  const letters = useMemo(
    () => scramble(word).split(''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word, seed],
  )

  const built = picked.map((i) => letters[i]).join('')

  function submit(nextPicked: number[]) {
    if (!word) return
    const guess = nextPicked.map((i) => letters[i]).join('')
    const ok = guess.toLowerCase() === word.toLowerCase()
    if (!ok && guess.length < word.length) return
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
      setPicked([])
      if (index + 1 >= round.length) {
        const sessionReward = recordSession({
          kind: 'spelling',
          mode: 'Unscramble',
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

  function tap(i: number) {
    if (state === 'correct' || picked.includes(i)) return
    const next = [...picked, i]
    setPicked(next)
    if (next.length === word.length) submit(next)
  }

  function replay() {
    nextRound()
    score.reset()
    setIndex(0)
    setSeed((s) => s + 1)
    setPicked([])
    setDone(false)
    setState(null)
  }

  if (!word) {
    return (
      <GameShell title="Unscramble" onExit={onExit}>
        <p className="text-center text-white/70">Add spelling words in Parent Mode to start this quest.</p>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Unscramble"
      subtitle="Tap the letters in the right order"
      icon={<Shuffle size={22} aria-hidden />}
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
          <div className="flex min-h-[64px] flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-black/30 p-3">
            {built ? (
              built.split('').map((c, i) => (
                <motion.span
                  key={`${c}-${i}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="grid h-12 w-12 place-items-center rounded-xl bg-electric-blue/30 font-display text-2xl text-white"
                >
                  {c.toUpperCase()}
                </motion.span>
              ))
            ) : (
              <span className="text-white/40">Tap letters below…</span>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Letter tiles">
            {letters.map((c, i) => (
              <button
                key={`${c}-${i}`}
                className={`grid h-14 w-14 place-items-center rounded-2xl border-2 font-display text-2xl transition-all ${
                  picked.includes(i)
                    ? 'border-white/10 bg-white/5 text-white/20'
                    : 'border-white/20 bg-white/10 text-white hover:border-electric-cyan hover:bg-white/20'
                }`}
                onClick={() => tap(i)}
                disabled={picked.includes(i) || state === 'correct'}
                aria-label={`Letter ${c.toUpperCase()}`}
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button className="btn-ghost text-base" onClick={() => setPicked([])} disabled={!picked.length}>
              <Delete size={18} aria-hidden /> Clear
            </button>
          </div>

          <AnswerFeedback state={state} />
        </>
      )}
    </GameShell>
  )
}
