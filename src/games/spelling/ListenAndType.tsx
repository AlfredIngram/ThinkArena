import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { SpellingGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { AnswerInput } from '../../components/AnswerInput'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { usePracticeWords } from '../../hooks/usePracticeWords'
import { useGame } from '../../context/GameContext'
import { speak, speakLetters, ttsAvailable } from '../../utils/tts'

const TOTAL = 8

/** Mode 5 - hear the word (browser text-to-speech) and type it. */
export function ListenAndType({ words, onExit }: SpellingGameProps) {
  const { recordSpellingAttempt, recordSession, buzz } = useGame()
  const { round, nextRound } = usePracticeWords(words, TOTAL)
  const score = useRound()

  const [index, setIndex] = useState(0)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })
  const [plays, setPlays] = useState(0)

  const word = round[index] ?? ''
  const supported = ttsAvailable()

  useEffect(() => {
    setState(null)
    setPlays(0)
    if (word && supported) speak(word)
  }, [index, word, supported])

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
          mode: 'Listen and Type',
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
    setGains({ xp: 0, coins: 0 })
  }

  if (!word) {
    return (
      <GameShell title="Listen and Type" onExit={onExit}>
        <p className="text-center text-white/70">Add spelling words in Parent Mode to start this quest.</p>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Listen and Type"
      subtitle="Listen carefully, then spell what you hear"
      icon={<Volume2 size={22} aria-hidden />}
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
          <div className="grid min-h-[110px] place-items-center rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
            {supported ? (
              <p className="font-display text-2xl text-white/80">
                Listen… then type the word you hear
                <span className="mt-1 block text-xs text-white/40">(played {plays} times)</span>
              </p>
            ) : (
              <p className="font-display text-xl text-orange-200">
                Speech isn’t available in this browser. Ask a grown-up to read the word aloud.
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              className="btn-primary text-base"
              onClick={() => {
                speak(word)
                setPlays((p) => p + 1)
              }}
              disabled={!supported}
            >
              <Volume2 size={18} aria-hidden /> Hear it again
            </button>
            <button
              className="btn-ghost text-base"
              onClick={() => {
                speakLetters(word)
                setPlays((p) => p + 1)
              }}
              disabled={!supported}
            >
              Spell it for me
            </button>
          </div>

          <AnswerInput onSubmit={handleSubmit} disabled={state === 'correct'} resetKey={index} autoFocus />
          {state === 'incorrect' && (
            <p className="text-center font-display text-2xl text-electric-gold">{word.toUpperCase()}</p>
          )}
          <AnswerFeedback state={state} />
        </>
      )}
    </GameShell>
  )
}
