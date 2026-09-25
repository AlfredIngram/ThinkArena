import type { SpellingWordStats } from '../types'
import { pickWeighted, type Rng, defaultRng } from '../utils/random'
import { masteryOf } from '../utils/spelling'

/**
 * Adaptive spelling selection.
 *
 * Design rules:
 *  - Words the student misses show up more often.
 *  - Mastered words are never removed - their frequency is just reduced.
 *  - Brand-new words get a moderate-to-high weight so they get introduced.
 *
 * The weight is an inverse-mastery curve: a 0% word is ~5x more likely than a
 * 100% word, and new words sit in between.
 */
export const NEW_WORD_WEIGHT = 3.5
export const MIN_WEIGHT = 0.4
export const MAX_WEIGHT = 6

export function weightForWord(word: string, stats: SpellingWordStats | undefined): number {
  if (!stats || stats.attempts === 0) return NEW_WORD_WEIGHT

  const mastery = masteryOf(stats)
  // 0 mastery -> ~5.4, 100 mastery -> min weight.
  const base = 1 + (100 - mastery) / 22

  // Recent misses get an extra nudge.
  const missRatio = stats.incorrect / Math.max(1, stats.attempts)
  const missBoost = 1 + missRatio

  // Very few attempts -> keep it in rotation aggressively.
  const attemptsFactor = stats.attempts < 3 ? 1.35 : 1

  const weight = base * missBoost * attemptsFactor
  return Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, weight))
}

/** Pick the next word to drill, favouring weak words. */
export function pickSpellingWord(
  words: string[],
  statsMap: Record<string, SpellingWordStats>,
  rng: Rng = defaultRng,
): string {
  if (words.length === 0) return ''
  return pickWeighted(words, (w) => weightForWord(w, statsMap[w]), rng)
}

/** Build an ordered practice round, avoiding back-to-back repeats where possible. */
export function buildPracticeRound(
  words: string[],
  statsMap: Record<string, SpellingWordStats>,
  count: number,
  rng: Rng = defaultRng,
): string[] {
  const out: string[] = []
  let guard = 0
  while (out.length < count && guard++ < count * 12) {
    const w = pickSpellingWord(words, statsMap, rng)
    if (w && out[out.length - 1] !== w) out.push(w)
  }
  // Fallback if the list is tiny (e.g. one word).
  while (out.length < count) out.push(pickSpellingWord(words, statsMap, rng))
  return out
}

/** How many words are considered "mastered" (>=80% accuracy with 2+ tries). */
export const MASTERY_THRESHOLD = 80

export function isMastered(stats: SpellingWordStats | undefined): boolean {
  if (!stats) return false
  return stats.attempts >= 2 && masteryOf(stats) >= MASTERY_THRESHOLD
}

export function masteredCount(
  words: string[],
  statsMap: Record<string, SpellingWordStats>,
): number {
  return words.filter((w) => isMastered(statsMap[w])).length
}

/** Weakest words first - used by the parent dashboard. */
export function weakestWords(
  words: string[],
  statsMap: Record<string, SpellingWordStats>,
): SpellingWordStats[] {
  return words
    .map(
      (w) =>
        statsMap[w] ?? { word: w, attempts: 0, correct: 0, incorrect: 0, mastery: 0 },
    )
    .sort((a, b) => a.mastery - b.mastery)
}
