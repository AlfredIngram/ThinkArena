import { BookOpen, CheckCircle2 } from 'lucide-react'
import type { VerseGameProps } from '../types'
import { GameShell } from '../../components/GameShell'
import { useGame } from '../../context/GameContext'
import { useState } from 'react'
import { Confetti } from '../../components/Confetti'

/**
 * STAGE 1 - READ. Shows the full verse and rewards the student for reading it.
 */
export function ReadVerse({ reference, text, onExit }: VerseGameProps) {
  const { recordVerseStage, buzz } = useGame()
  const [claimed, setClaimed] = useState(false)

  function finish() {
    if (claimed) return
    setClaimed(true)
    recordVerseStage(reference, 1, true)
    buzz('correct')
  }

  return (
    <GameShell
      title="Stage 1 · Read"
      subtitle={reference}
      icon={<BookOpen size={22} aria-hidden />}
      onExit={onExit}
    >
      <div className="relative rounded-2xl border border-white/10 bg-black/30 p-6">
        <p className="text-center font-display text-2xl leading-relaxed text-white sm:text-3xl">{text}</p>
        <p className="mt-4 text-center font-bold text-electric-cyan">{reference}</p>
      </div>

      {claimed ? (
        <div className="relative flex flex-col items-center gap-2 py-4">
          <Confetti trigger={1} count={20} />
          <CheckCircle2 className="text-lime-400" size={42} aria-hidden />
          <p className="font-display text-2xl text-lime-200">Stage 1 complete! +40 XP</p>
        </div>
      ) : (
        <div className="flex justify-center">
          <button className="btn-success" onClick={finish}>
            <CheckCircle2 size={20} aria-hidden /> I read the verse
          </button>
        </div>
      )}
    </GameShell>
  )
}
