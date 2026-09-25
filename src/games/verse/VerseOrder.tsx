import { useMemo, useState } from 'react'
import { ListOrdered, Eraser } from 'lucide-react'
import type { VerseGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { RoundSummary } from '../../components/RoundSummary'
import { useGame } from '../../context/GameContext'
import { normalizeVerse, verseSections } from '../../utils/verse'
import { shuffle } from '../../utils/random'

/** STAGE 4 - put the verse sections in the correct order. */
export function VerseOrder({ reference, text, onExit }: VerseGameProps) {
  const { recordVerseStage, recordSession, buzz } = useGame()

  const [attempt, setAttempt] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const [state, setState] = useState<'correct' | 'incorrect' | null>(null)
  const [gains, setGains] = useState({ xp: 0, coins: 0 })

  const sections = useMemo(() => verseSections(text), [text])
  const shuffled = useMemo(
    () => shuffle(sections.map((s, i) => ({ s, i }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sections.join('|'), attempt],
  )

  function tap(i: number) {
    if (state === 'correct' || picked.includes(i)) return
    const next = [...picked, i]
    setPicked(next)
    if (next.length === sections.length) submit(next)
  }

  function submit(order: number[]) {
    const built = order.map((i) => sections[i]).join(' ')
    const ok = normalizeVerse(built) === normalizeVerse(sections.join(' '))
    setState(ok ? 'correct' : 'incorrect')
    const reward = recordVerseStage(reference, 4, ok)
    setGains((g) => ({ xp: g.xp + reward.xpGained, coins: g.coins + reward.coinsGained }))
    buzz(ok ? 'correct' : 'incorrect')
    if (ok) {
      const sessionReward = recordSession({ kind: 'verse', mode: 'Verse Order', correct: 1, total: 1 })
      setGains((g) => ({ xp: g.xp + sessionReward.xpGained, coins: g.coins + sessionReward.coinsGained }))
    }
  }

  function retry() {
    setAttempt((a) => a + 1)
    setPicked([])
    setState(null)
  }

  return (
    <GameShell
      title="Stage 4 · Put It In Order"
      subtitle={reference}
      icon={<ListOrdered size={22} aria-hidden />}
      onExit={onExit}
      wide
    >
      {state === 'correct' ? (
        <RoundSummary
          correct={1}
          total={1}
          xpGained={gains.xp}
          coinsGained={gains.coins}
          onReplay={retry}
          onExit={onExit}
          extra="You know the order by heart!"
        />
      ) : (
        <>
          <div className="min-h-[100px] rounded-2xl border-2 border-dashed border-white/15 bg-black/30 p-4">
            {picked.length ? (
              <ol className="space-y-2">
                {picked.map((i, pos) => (
                  <li key={i} className="rounded-xl bg-electric-blue/20 p-3 font-display text-lg text-white">
                    <span className="mr-2 text-electric-cyan">{pos + 1}.</span>
                    {sections[i]}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-center text-white/40">Tap the sections below in the right order…</p>
            )}
          </div>

          <div className="space-y-2" role="group" aria-label="Verse sections">
            {shuffled.map(({ s, i }) => (
              <button
                key={s}
                className={`w-full rounded-2xl border-2 p-3 text-left font-display text-lg transition-all ${
                  picked.includes(i)
                    ? 'border-white/10 bg-white/5 text-white/25'
                    : 'border-white/20 bg-white/10 text-white hover:border-electric-cyan hover:bg-white/20'
                }`}
                onClick={() => tap(i)}
                disabled={picked.includes(i)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            <button className="btn-ghost text-base" onClick={() => setPicked([])} disabled={!picked.length}>
              <Eraser size={18} aria-hidden /> Clear
            </button>
          </div>

          {state === 'incorrect' && (
            <p className="text-center font-display text-xl text-orange-200">NOT QUITE - TRY AGAIN!</p>
          )}
        </>
      )}
    </GameShell>
  )
}
