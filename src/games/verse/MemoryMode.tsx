import { useMemo, useState } from 'react'
import { Brain, Eraser } from 'lucide-react'
import type { VerseGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { AnswerInput } from '../../components/AnswerInput'
import { RoundSummary } from '../../components/RoundSummary'
import { useGame } from '../../context/GameContext'
import { blankVerse, buildChips, normalizeVerse, verseSections, verseMatches } from '../../utils/verse'
import { shuffle } from '../../utils/random'

interface MemoryModeProps extends VerseGameProps {
  /** 5 = fill most blanks, 6 = type the whole verse. */
  stage: 5 | 6
}

const MASTERED_STAGE = 6

/** STAGES 5 & 6 - Memory Mode and Verse Master. */
export function MemoryMode({ reference, text, stage, onExit }: MemoryModeProps) {
  const { recordVerseStage, recordSession, buzz } = useGame()

  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })

  const { tokens, missing, chips } = useMemo(() => {
    const blanked = blankVerse(text, stage === 5 ? 0.75 : 1)
    return { ...blanked, chips: buildChips(blanked.missing) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, stage, attempt])

  const built = picked.map((id) => chips.find((c) => c.id === id)?.word ?? '')

  function rewardAnswer(ok: boolean) {
    const mastered = ok && stage === MASTERED_STAGE && verseMatches(text, text)
    const reward = recordVerseStage(reference, stage, ok, mastered)
    setGains((g) => ({ xp: g.xp + reward.xpGained, coins: g.coins + reward.coinsGained }))
    if (ok) {
      const sessionReward = recordSession({
        kind: 'verse',
        mode: stage === 6 ? 'Verse Master' : 'Memory Mode',
        correct: 1,
        total: 1,
      })
      setGains((g) => ({ xp: g.xp + sessionReward.xpGained, coins: g.coins + sessionReward.coinsGained }))
    }
  }

  function tap(id: string) {
    if (state === 'correct' || picked.includes(id)) return
    const next = [...picked, id]
    setPicked(next)
    if (next.length === missing.length) {
      const words = next.map((i) => chips.find((c) => c.id === i)?.word ?? '')
      const ok = normalizeVerse(words.join(' ')) === normalizeVerse(missing.join(' '))
      setState(ok ? 'correct' : 'incorrect')
      buzz(ok ? 'correct' : 'incorrect')
      rewardAnswer(ok)
    }
  }

  function submitTyped(value: string) {
    const ok = verseMatches(value, text)
    setState(ok ? 'correct' : 'incorrect')
    buzz(ok ? 'correct' : 'incorrect')
    rewardAnswer(ok)
  }

  function retry() {
    setAttempt((a) => a + 1)
    setPicked([])
    setState(null)
  }

  let blankIndex = -1
  const rendered = tokens.map((t) => {
    if (!t.hidden) return { ...t, blankIndex: -1 }
    blankIndex += 1
    return { ...t, blankIndex }
  })

  const title = stage === 5 ? 'Stage 5 · Memory Mode' : 'Stage 6 · Verse Master'

  return (
    <GameShell title={title} subtitle={reference} icon={<Brain size={22} aria-hidden />} onExit={onExit} wide>
      {state === 'correct' ? (
        <RoundSummary
          correct={1}
          total={1}
          xpGained={gains.xp}
          coinsGained={gains.coins}
          onReplay={retry}
          onExit={onExit}
          extra={stage === 6 ? 'VERSE MASTERED! Amazing work!' : 'Memory Mode complete!'}
        />
      ) : (
        <>
          {stage === 5 && (
            <>
              <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-center font-display text-xl leading-relaxed text-white">
                {rendered.map((t, i) =>
                  t.hidden ? (
                    <span
                      key={i}
                      className={`inline-block min-w-[80px] rounded-lg border-b-4 px-2 ${
                        built[t.blankIndex] ? 'border-electric-cyan text-electric-cyan' : 'border-white/30 text-white/30'
                      }`}
                    >
                      {built[t.blankIndex] ?? '____'}
                    </span>
                  ) : (
                    <span key={i}>{t.word}</span>
                  ),
                )}
              </p>

              <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Word chips">
                {chips.map((chip) => (
                  <button
                    key={chip.id}
                    className={`min-h-[52px] rounded-2xl border-2 px-4 font-display text-xl transition-all ${
                      picked.includes(chip.id)
                        ? 'border-white/10 bg-white/5 text-white/25'
                        : 'border-white/20 bg-white/10 text-white hover:border-electric-cyan hover:bg-white/20'
                    }`}
                    onClick={() => tap(chip.id)}
                    disabled={picked.includes(chip.id)}
                  >
                    {chip.word}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button className="btn-ghost text-base" onClick={() => setPicked([])} disabled={!picked.length}>
                  <Eraser size={18} aria-hidden /> Clear
                </button>
              </div>
            </>
          )}

          {stage === 6 && (
            <>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                <p className="font-display text-xl text-electric-cyan">{reference}</p>
                <p className="mt-1 text-sm text-white/60">
                  Type the whole verse from memory. Take all the time you need.
                </p>
              </div>
              <AnswerInput
                onSubmit={submitTyped}
                resetKey={attempt}
                placeholder="Type the verse…"
                buttonLabel="Check"
                autoFocus
              />
            </>
          )}

          {state === 'incorrect' && (
            <div className="rounded-2xl border border-orange-400/30 bg-orange-500/10 p-4 text-center">
              <p className="font-display text-xl text-orange-100">NOT QUITE - KEEP GOING!</p>
              <p className="mt-2 text-sm text-white/80">{text}</p>
              {stage === 5 && <p className="mt-1 text-xs text-white/60">(Here it is again - try once more!)</p>}
            </div>
          )}
        </>
      )}
    </GameShell>
  )
}

export { verseSections }
