import { useMemo, useState } from 'react'
import { ListChecks } from 'lucide-react'
import type { SpellingGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { ChoiceGrid } from '../../components/ChoiceGrid'
import { AnswerFeedback } from '../../components/AnswerFeedback'
import { RoundSummary } from '../../components/RoundSummary'
import { useRound } from '../../hooks/useRound'
import { usePracticeWords } from '../../hooks/usePracticeWords'
import { useGame } from '../../context/GameContext'
import { spellingOptions } from '../../utils/spelling'

const TOTAL = 8

/** Mode 1 - choose the correctly spelled word. */
export function MultipleChoice({ words, onExit }: SpellingGameProps) {
  const { recordSpellingAttempt, recordSession, buzz } = useGame()
  const { round, nextRound } = usePracticeWords(words, TOTAL)
  const score = useRound()

  const [index, setIndex] = useState(0)
  const [seed, setSeed] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })
  const [done, setDone] = useState(false)
  const [answered, setAnswered] = useState(0)

  const word = round[index]

  // Options stay stable for a given word+seed and refresh for each new question.
  const options = useMemo(
    () => (word ? spellingOptions(word) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [word, seed],
  )

  function handleSelect(option: string) {
    if (state || !word) return
    const ok = option.toLowerCase() === word.toLowerCase()
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
          mode: 'Multiple Choice',
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

  if (!round.length) {
    return (
      <GameShell title="Choose the Correct Word" onExit={onExit}>
        <p className="text-center text-white/70">Add spelling words in Parent Mode to start this quest.</p>
      </GameShell>
    )
  }

  return (
    <GameShell
      title="Choose the Correct Word"
      subtitle="Tap the word that is spelled correctly"
      icon={<ListChecks size={22} aria-hidden />}
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
          <p className="text-center font-display text-2xl text-white">
            Question {index + 1} of {round.length}
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
