import { useMemo, useState } from 'react'
import { Eraser, Puzzle } from 'lucide-react'
import { motion } from 'framer-motion'
import type { VerseGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { RoundSummary } from '../../components/RoundSummary'
import { useGame } from '../../context/GameContext'
import { blankVerse, buildChips, normalizeVerse } from '../../utils/verse'
import { shuffle } from '../../utils/random'

interface MissingWordsProps extends VerseGameProps {
  /** 2 = a few words hidden, 3 = roughly half hidden. */
  stage: 2 | 3
}

const FRACTION: Record<2 | 3, number> = { 2: 0.25, 3: 0.5 }

/** STAGES 2 & 3 - fill in the missing words by tapping the word chips. */
export function MissingWords({ reference, text, stage, onExit }: MissingWordsProps) {
  const { recordVerseStage, recordSession, buzz } = useGame()

  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })

  const { tokens, missing, chips } = useMemo(() => {
    const blanked = blankVerse(text, FRACTION[stage])
    return { ...blanked, chips: buildChips(blanked.missing) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, stage, attempt])

  const built = picked.map((id) => chips.find((c) => c.id === id)?.word ?? '')

  function submit(ids: string[]) {
    const words = ids.map((id) => chips.find((c) => c.id === id)?.word ?? '')
    const ok = normalizeVerse(words.join(' ')) === normalizeVerse(missing.join(' '))
    setState(ok ? 'correct' : 'incorrect')
    const reward = recordVerseStage(reference, stage, ok)
    setGains((g) => ({ xp: g.xp + reward.xpGained, coins: g.coins + reward.coinsGained }))
    buzz(ok ? 'correct' : 'incorrect')
    if (ok) {
      const sessionReward = recordSession({ kind: 'verse', mode: `Missing Words ${stage}`, correct: 1, total: 1 })
      setGains((g) => ({ xp: g.xp + sessionReward.xpGained, coins: g.coins + sessionReward.coinsGained }))
    }
  }

  function tap(id: string) {
    if (state === 'correct' || picked.includes(id)) return
    const next = [...picked, id]
    setPicked(next)
    if (next.length === missing.length) submit(next)
  }

  function retry() {
    setAttempt((a) => a + 1)
    setPicked([])
    setState(null)
  }

  // Where is the next blank in the verse?
  let blankIndex = -1
  const rendered = tokens.map((t) => {
    if (!t.hidden) return { ...t, blankIndex: -1 }
    blankIndex += 1
    return { ...t, blankIndex }
  })

  return (
    <GameShell
      title={`Stage ${stage} · ${stage === 2 ? 'Missing Words' : 'More Words Missing'}`}
      subtitle={reference}
      icon={<Puzzle size={22} aria-hidden />}
      onExit={onExit}
    >
      {state === 'correct' ? (
        <RoundSummary
          correct={1}
          total={1}
          xpGained={gains.xp}
          coinsGained={gains.coins}
          onReplay={retry}
          onExit={onExit}
          extra="Verse stage complete!"
        />
      ) : (
        <>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3 rounded-2xl border border-white/10 bg-black/30 p-5 text-center font-display text-2xl leading-relaxed text-white">
            {rendered.map((t, i) =>
              t.hidden ? (
                <span
                  key={i}
                  className={`inline-block min-w-[90px] rounded-lg border-b-4 px-2 ${
                    built[t.blankIndex] ? 'border-electric-cyan text-electric-cyan' : 'border-white/30 text-white/30'
                  }`}
                >
                  {built[t.blankIndex] ?? '_____'}
                </span>
              ) : (
                <span key={i}>{t.word}</span>
              ),
            )}
          </p>

          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Word chips">
            {chips.map((chip) => (
              <motion.button
                key={chip.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`min-h-[52px] rounded-2xl border-2 px-4 font-display text-xl transition-all ${
                  picked.includes(chip.id)
                    ? 'border-white/10 bg-white/5 text-white/25'
                    : 'border-white/20 bg-white/10 text-white hover:border-electric-cyan hover:bg-white/20'
                }`}
                onClick={() => tap(chip.id)}
                disabled={picked.includes(chip.id)}
                aria-label={`Word: ${chip.word}`}
              >
                {chip.word}
              </motion.button>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <button className="btn-ghost text-base" onClick={() => setPicked([])} disabled={!picked.length}>
              <Eraser size={18} aria-hidden /> Clear
            </button>
          </div>

          {state === 'incorrect' && (
            <p className="text-center font-display text-xl text-orange-200">
              NOT QUITE - TRY AGAIN! Using the words again helps you remember them.
            </p>
          )}
        </>
      )}
    </GameShell>
  )
}
