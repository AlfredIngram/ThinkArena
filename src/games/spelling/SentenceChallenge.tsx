import { useMemo, useState } from 'react'
import { MessageSquareQuote } from 'lucide-react'
import type { SpellingGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { ChoiceGrid } from '../../components/ChoiceGrid'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { usePracticeWords } from '../../hooks/usePracticeWords'
import { useGame } from '../../context/GameContext'
import { buildChoices, sentenceFor } from '../../utils/spelling'

const TOTAL = 8

/** Mode 6 - pick the word that completes the sentence. */
export function SentenceChallenge({ words, onExit }: SpellingGameProps) {
  const { recordSpellingAttempt, recordSession, buzz } = useGame()
  const { round, nextRound } = usePracticeWords(words, TOTAL)
  const score = useRound()

  const [index, setIndex] = useState(0)
  const [seed, setSeed] = useState(0)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [chosen, setChosen] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })

  const word = round[index] ?? ''
  const sentence = useMemo(() => sentenceFor(word), [word])
  const options = useMemo(
    () => (word ? buildChoices(words, word, Math.min(4, Math.max(2, words.length))) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word, seed, words.join('|')],
  )

  function handleSelect(option: string) {
    if (state || !word) return
    const ok = option.trim().toLowerCase() === word.toLowerCase()
    setChosen(option)
    setState(ok ? 'correct' : 'incorrect')
    score.answer(ok)
    const reward = recordSpellingAttempt(word, ok)
    setGains((g) => ({ xp: g.xp + reward.xpGained, coins: g.coins + reward.coinsGained }))
    buzz(ok ? 'correct' : 'incorrect')

    const nextCorrect = score.correct + (ok ? 1 : 0)
    const nextTotal = score.total + 1
    setAnswered(nextTotal)

    window.setTimeout(() => {
      setChosen(null)
      setState(null)
      if (index + 1 >= round.length) {
        const sessionReward = recordSession({
          kind: 'spelling',
          mode: 'Sentence Challenge',
          correct: nextCorrect,
          total: nextTotal,
        })
        setGains((g) => ({ xp: g.xp + sessionReward.xpGained, coins: g.coins + sessionReward.coinsGained }))
        setDone(true)
      } else {
        setIndex((i) => i + 1)
      }
    }, ok ? 900 : 1600)
  }

  function replay() {
    nextRound()
    score.reset()
    setIndex(0)
    setSeed((s) => s + 1)
    setDone(false)
    setState(null)
    setChosen(null)
    setGains({ xp: 0, coins: 0 })
  }

  if (!word) {
    return (
      <GameShell title="Sentence Challenge" onExit={onExit}>
        <p className="text-center text-white/70">Add spelling words in Parent Mode to start this quest.</p>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Sentence Challenge"
      subtitle="Which word finishes the sentence?"
      icon={<MessageSquareQuote size={22} aria-hidden />}
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
          <p className="rounded-2xl border border-white/10 bg-black/30 p-5 text-center font-display text-2xl leading-snug text-white sm:text-3xl">
            {sentence}
          </p>
          <ChoiceGrid
            options={options}
            onSelect={handleSelect}
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
