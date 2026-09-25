import type { DifficultyLevel, MathTopic } from '../types'

export interface SpellingGameProps {
  words: string[]
  onExit: () => void
}

export interface MathGameProps {
  topics: MathTopic[]
  difficulty: DifficultyLevel
  onExit: () => void
}

export interface VerseGameProps {
  reference: string
  text: string
  onExit: () => void
}
