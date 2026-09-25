import { useState } from 'react'
import {
  Crown,
  Eye,
  ListChecks,
  LetterText,
  MessageSquareQuote,
  Shuffle,
  Timer,
  Volume2,
} from 'lucide-react'
import { useGame } from '../context/GameContext'
import { GameCard } from '../components/GameCard'
import { MultipleChoice } from '../games/spelling/MultipleChoice'
import { MissingLetters } from '../games/spelling/MissingLetters'
import { Unscramble } from '../games/spelling/Unscramble'
import { TypeWord } from '../games/spelling/TypeWord'
import { ListenAndType } from '../games/spelling/ListenAndType'
import { SentenceChallenge } from '../games/spelling/SentenceChallenge'
import { SpeedRound } from '../games/spelling/SpeedRound'
import { SpellingBoss } from '../games/spelling/SpellingBoss'

type ModeId =
  | 'multiple-choice'
  | 'missing-letters'
  | 'unscramble'
  | 'type-word'
  | 'listen'
  | 'sentence'
  | 'speed'
  | 'boss'

interface ModeInfo {
  id: ModeId
  title: string
  blurb: string
  icon: typeof ListChecks
  color: string
}

const MODES: ModeInfo[] = [
  { id: 'multiple-choice', title: 'Choose the Word', blurb: 'Pick the correct spelling', icon: ListChecks, color: 'text-electric-cyan' },
  { id: 'missing-letters', title: 'Missing Letters', blurb: 'Fill in the blanks', icon: LetterText, color: 'text-electric-lime' },
  { id: 'unscramble', title: 'Unscramble', blurb: 'Tap letters in order', icon: Shuffle, color: 'text-electric-blue' },
  { id: 'type-word', title: 'Type the Word', blurb: 'Memorize, then type', icon: Eye, color: 'text-electric-gold' },
  { id: 'listen', title: 'Listen and Type', blurb: 'Hear it, then spell it', icon: Volume2, color: 'text-electric-pink' },
  { id: 'sentence', title: 'Sentence Challenge', blurb: 'Finish the sentence', icon: MessageSquareQuote, color: 'text-emerald-300' },
  { id: 'speed', title: 'Speed Round', blurb: '60 seconds of fun', icon: Timer, color: 'text-orange-300' },
  { id: 'boss', title: 'BOSS BATTLE', blurb: 'Defeat the Glitch Dragon', icon: Crown, color: 'text-electric-gold' },
]

/** Spelling = adventure/quest. This page is the quest board. */
export function SpellingQuest() {
  const { lesson } = useGame()
  const [mode, setMode] = useState<ModeId | null>(null)
  const words = lesson.spellingWords

  const exit = () => setMode(null)

  if (mode === 'multiple-choice') return <MultipleChoice words={words} onExit={exit} />
  if (mode === 'missing-letters') return <MissingLetters words={words} onExit={exit} />
  if (mode === 'unscramble') return <Unscramble words={words} onExit={exit} />
  if (mode === 'type-word') return <TypeWord words={words} onExit={exit} />
  if (mode === 'listen') return <ListenAndType words={words} onExit={exit} />
  if (mode === 'sentence') return <SentenceChallenge words={words} onExit={exit} />
  if (mode === 'speed') return <SpeedRound words={words} onExit={exit} />
  if (mode === 'boss') return <SpellingBoss words={words} onExit={exit} />

  return (
    <div className="space-y-5">
      <header className="text-center">
        <h1 className="font-display text-4xl text-white text-outline">SPELLING QUEST</h1>
        <p className="mt-1 text-white/70">
          {words.length} words this week · pick a challenge and earn XP
        </p>
      </header>

      <GameCard className="text-center">
        <p className="font-display text-sm uppercase tracking-widest text-electric-cyan">This week’s words</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {words.map((w) => (
            <span key={w} className="chip border-white/10 text-white/90">
              {w}
            </span>
          ))}
        </div>
      </GameCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MODES.map(({ id, title, blurb, icon: Icon, color }) => (
          <GameCard key={id} interactive onClick={() => setMode(id)} className="text-center">
            <Icon className={`mx-auto ${color}`} size={34} aria-hidden />
            <p className="mt-3 font-display text-lg text-white">{title}</p>
            <p className="mt-1 text-xs text-white/60">{blurb}</p>
          </GameCard>
        ))}
      </div>
    </div>
  )
}
