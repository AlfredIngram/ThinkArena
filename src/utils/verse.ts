import type { Rng } from './random'
import { defaultRng, shuffle } from './random'

/** Lowercase, strip punctuation, collapse whitespace - used for answer checks. */
export function normalizeVerse(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function verseMatches(input: string, target: string): boolean {
  return normalizeVerse(input) === normalizeVerse(target)
}

export interface BlankedVerse {
  tokens: { word: string; hidden: boolean }[]
  /** The hidden words, in the order they appear. */
  missing: string[]
}

/** Blank out a fraction of the verse's words. */
export function blankVerse(text: string, fraction: number, rng: Rng = defaultRng): BlankedVerse {
  const words = text.split(/\s+/).filter(Boolean)
  const hideCount = Math.max(1, Math.round(words.length * fraction))
  const indices = shuffle(
    words.map((_, i) => i),
    rng,
  ).slice(0, Math.min(hideCount, words.length))
  const hiddenSet = new Set(indices)

  const tokens = words.map((word, i) => ({ word, hidden: hiddenSet.has(i) }))
  const missing = words.filter((_, i) => hiddenSet.has(i))
  return { tokens, missing }
}

/** Split the verse into orderable chunks at punctuation boundaries. */
export function verseSections(text: string): string[] {
  const parts: string[] = []
  let buffer = ''
  for (const char of text.trim()) {
    buffer += char
    if (',;:!?.'.includes(char)) {
      if (buffer.trim()) parts.push(buffer.trim())
      buffer = ''
    }
  }
  if (buffer.trim()) parts.push(buffer.trim())
  return parts.filter((p) => p.length > 0)
}

/** Chips for tap-in-order exercises: the missing words plus optional decoys. */
export interface Chip {
  id: string
  word: string
}

export function buildChips(words: string[], rng: Rng = defaultRng): Chip[] {
  return shuffle(
    words.map((word, i) => ({ id: `chip-${i}-${word}`, word })),
    rng,
  )
}
