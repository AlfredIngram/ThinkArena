import type { SpellingWordStats } from '../types'
import { pick, randInt, shuffle, type Rng, defaultRng } from './random'

export function normalizeWord(word: string): string {
  return word.trim().toLowerCase()
}

const VOWELS = ['a', 'e', 'i', 'o', 'u']

/** Turn a word into a display string with some letters blanked out. */
export function hideLetters(
  word: string,
  fraction: number,
  rng: Rng = defaultRng,
): { display: string; hidden: number[] } {
  const chars = word.split('')
  const hideCount = Math.max(1, Math.round(chars.length * fraction))
  const candidates = chars
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => /[a-z]/i.test(c))
    .map(({ i }) => i)

  const hidden = shuffle(candidates, rng).slice(0, Math.min(hideCount, candidates.length))
  const display = chars.map((c, i) => (hidden.includes(i) ? '_' : c)).join('')
  return { display, hidden }
}

/** Blank only the vowel positions - a friendlier missing-letters round. */
export function hideVowels(word: string): { display: string; hidden: number[] } {
  const chars = word.split('')
  const hidden: number[] = []
  chars.forEach((c, i) => {
    if (VOWELS.includes(c.toLowerCase())) hidden.push(i)
  })
  return { display: chars.map((c, i) => (hidden.includes(i) ? '_' : c)).join(''), hidden }
}

export function scramble(word: string, rng: Rng = defaultRng): string {
  const chars = word.split('')
  if (chars.length < 2) return word.toUpperCase()
  let out = shuffle(chars, rng).join('')
  let guard = 0
  while (out.toLowerCase() === word.toLowerCase() && guard++ < 12) {
    out = shuffle(chars, rng).join('')
  }
  return out.toUpperCase()
}

/** Build multiple-choice options from the weekly list, padded from a fallback bank. */
export function buildChoices(
  weeklyWords: string[],
  correct: string,
  count = 4,
  rng: Rng = defaultRng,
): string[] {
  const pool = weeklyWords.filter((w) => normalizeWord(w) !== normalizeWord(correct))
  let distractors = shuffle(pool, rng).slice(0, count - 1)

  // Need more options than the weekly list provides - invent near-miss spellings.
  let guard = 0
  while (distractors.length < count - 1 && guard++ < 40) {
    const variant = misspell(correct, rng)
    if (
      variant.toLowerCase() !== correct.toLowerCase() &&
      !distractors.some((d) => d.toLowerCase() === variant.toLowerCase())
    ) {
      distractors.push(variant)
    }
  }

  return shuffle([correct, ...distractors], rng)
}

/**
 * Options for "choose the correctly spelled word": the real spelling plus
 * misspelled variants of the SAME word.
 */
export function spellingOptions(word: string, count = 4, rng: Rng = defaultRng): string[] {
  const options = new Set<string>([word])
  let guard = 0
  while (options.size < count && guard++ < 60) {
    options.add(misspell(word, rng))
  }
  return shuffle([...options], rng)
}

/** Produce a plausible-but-wrong spelling: drop, double, or swap letters. */
export function misspell(word: string, rng: Rng = defaultRng): string {
  const chars = word.split('')
  const mode = randInt(0, 3, rng)
  const i = randInt(0, chars.length - 1, rng)

  if (mode === 0 && chars.length > 3) {
    chars.splice(i, 1) // drop a letter
  } else if (mode === 1) {
    chars.splice(i, 0, chars[i]) // double a letter
  } else if (mode === 2 && i < chars.length - 1) {
    ;[chars[i], chars[i + 1]] = [chars[i + 1], chars[i]] // swap neighbours
  } else {
    const swap = pick(VOWELS, rng)
    chars[i] = /[aeiou]/i.test(chars[i]) ? swap : chars[i]
  }
  return chars.join('')
}

/**
 * Short, kid-friendly sentences for the default spelling list. Any word not in
 * the bank gets a generic (still sensible) fill-in-the-blank sentence.
 */
const SENTENCE_BANK: Record<string, string> = {
  because: 'I stayed inside ___ it was raining.',
  friend: 'My best ___ came over to play.',
  people: 'Lots of ___ came to the school fair.',
  different: 'Her painting is ___ from mine.',
  favorite: 'Pizza is my ___ food.',
  another: 'Can I have ___ turn on the swing?',
  important: 'It is ___ to wash your hands.',
  example: 'Our teacher gave us an ___ to follow.',
  family: 'My ___ went to the park together.',
  school: 'We walk to ___ every morning.',
  together: 'Let us build the puzzle ___.',
  always: 'I ___ brush my teeth at night.',
  before: 'Wash your hands ___ you eat.',
  enough: 'There is ___ cake for everyone.',
  thought: 'I ___ about my answer carefully.',
  through: 'The train went ___ the tunnel.',
  question: 'I raised my hand to ask a ___.',
  answer: 'She knew the ___ right away.',
  morning: 'We eat breakfast in the ___.',
  animal: 'A giraffe is my favorite ___.',
  country: 'Canada is a large ___.',
  mountain: 'We hiked up a tall ___ .',
  weather: 'The ___ is sunny and warm today.',
  between: 'The ball rolled ___ the chairs.',
}

export function sentenceFor(word: string): string {
  return SENTENCE_BANK[normalizeWord(word)] ?? `Can you spell the word ___ correctly?`
}

export function masteryOf(stats: SpellingWordStats | undefined): number {
  if (!stats || stats.attempts === 0) return 0
  return Math.round((stats.correct / stats.attempts) * 100)
}
