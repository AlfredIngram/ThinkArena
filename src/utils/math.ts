import type { DifficultyLevel, MathTopic } from '../types'
import { pick, randInt, type Rng, defaultRng } from './random'

export interface MathProblem {
  question: string
  answer: number
  category: MathTopic
  /** Word problems carry the full story text plus a short prompt. */
  story?: string
}

const ADD_SUB_CONTEXT = ['blocks', 'stickers', 'apples', 'marbles', 'cards', 'crayons', 'coins', 'books']
const NAMES = ['Alex', 'Maya', 'Jordan', 'Sam', 'Riley', 'Nina', 'Leo', 'Zoe']

function additionProblem(difficulty: DifficultyLevel, rng: Rng): MathProblem {
  if (difficulty >= 3) {
    const a = randInt(20, 99, rng)
    const b = randInt(20, 99, rng)
    return { question: `${a} + ${b}`, answer: a + b, category: 'addition' }
  }
  if (difficulty === 2) {
    const a = randInt(10, 60, rng)
    const b = randInt(10, 40, rng)
    return { question: `${a} + ${b}`, answer: a + b, category: 'addition' }
  }
  const a = randInt(1, 9, rng)
  const b = randInt(1, 9, rng)
  return { question: `${a} + ${b}`, answer: a + b, category: 'addition' }
}

function subtractionProblem(difficulty: DifficultyLevel, rng: Rng): MathProblem {
  if (difficulty >= 3) {
    const a = randInt(40, 120, rng)
    const b = randInt(10, a - 1, rng)
    return { question: `${a} − ${b}`, answer: a - b, category: 'subtraction' }
  }
  if (difficulty === 2) {
    const a = randInt(20, 60, rng)
    const b = randInt(5, a - 1, rng)
    return { question: `${a} − ${b}`, answer: a - b, category: 'subtraction' }
  }
  const a = randInt(3, 18, rng)
  const b = randInt(1, a - 1, rng)
  return { question: `${a} − ${b}`, answer: a - b, category: 'subtraction' }
}

function multiplicationProblem(difficulty: DifficultyLevel, rng: Rng): MathProblem {
  const max = difficulty <= 1 ? 5 : difficulty === 2 ? 9 : 12
  const a = randInt(1, max, rng)
  const b = randInt(1, max, rng)
  return { question: `${a} × ${b}`, answer: a * b, category: 'multiplication' }
}

function divisionProblem(difficulty: DifficultyLevel, rng: Rng): MathProblem {
  const max = difficulty <= 1 ? 5 : difficulty === 2 ? 9 : 12
  const b = randInt(2, max, rng)
  const answer = randInt(1, max, rng)
  return { question: `${b * answer} ÷ ${b}`, answer, category: 'division' }
}

export function wordProblem(difficulty: DifficultyLevel, rng: Rng = defaultRng): MathProblem {
  const name = pick(NAMES, rng)
  const thing = pick(ADD_SUB_CONTEXT, rng)
  const high = difficulty >= 3 ? 99 : difficulty === 2 ? 45 : 20
  const start = randInt(Math.floor(high / 2), high, rng)
  const change = randInt(2, Math.max(3, Math.floor(start / 2)), rng)
  const isAdd = rng() > 0.5

  const story = isAdd
    ? `${name} has ${start} ${thing}. A friend gives ${name} ${change} more ${thing}. How many ${thing} does ${name} have now?`
    : `${name} has ${start} ${thing}. ${name} gives ${change} ${thing} to a friend. How many ${thing} does ${name} have left?`

  return {
    question: story,
    story,
    answer: isAdd ? start + change : start - change,
    category: 'wordProblems',
  }
}

const GENERATORS: Record<Exclude<MathTopic, 'mixed'>, (d: DifficultyLevel, r: Rng) => MathProblem> = {
  addition: additionProblem,
  subtraction: subtractionProblem,
  multiplication: multiplicationProblem,
  division: divisionProblem,
  wordProblems: (d, r) => wordProblem(d, r),
}

export function generateProblem(
  category: MathTopic,
  difficulty: DifficultyLevel,
  rng: Rng = defaultRng,
): MathProblem {
  if (category === 'mixed') {
    const keys = Object.keys(GENERATORS) as Exclude<MathTopic, 'mixed'>[]
    const chosen = pick(keys, rng)
    return GENERATORS[chosen](difficulty, rng)
  }
  return GENERATORS[category](difficulty, rng)
}

/** Build a run of problems from the enabled topics. */
export function generateRun(
  topics: MathTopic[],
  difficulty: DifficultyLevel,
  count: number,
  rng: Rng = defaultRng,
): MathProblem[] {
  const list = topics.length ? topics : (['mixed'] as MathTopic[])
  return Array.from({ length: count }, () => generateProblem(pick(list, rng), difficulty, rng))
}

/** Wrong-but-close answers for multiple choice. */
export function distractors(problem: MathProblem, count = 3, rng: Rng = defaultRng): number[] {
  const out = new Set<number>()
  let guard = 0
  while (out.size < count && guard++ < 60) {
    const delta = randInt(1, Math.max(2, Math.round(Math.abs(problem.answer) * 0.25) + 3), rng)
    const candidate = problem.answer + (rng() > 0.5 ? delta : -delta)
    if (candidate !== problem.answer && candidate >= 0) out.add(candidate)
  }
  return [...out]
}

export const MATH_TOPIC_LABELS: Record<MathTopic, string> = {
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  wordProblems: 'Word Problems',
  mixed: 'Mixed Review',
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: 'Level 1 · Single digits',
  2: 'Level 2 · Two digits',
  3: 'Level 3 · Multiply & divide',
  4: 'Level 4 · Mixed everything',
}
