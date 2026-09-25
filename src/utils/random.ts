/** Small random helpers so game logic stays deterministic-testable when seeded. */

export type Rng = () => number

export const defaultRng: Rng = Math.random

export function randInt(min: number, max: number, rng: Rng = defaultRng): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

export function pick<T>(items: T[], rng: Rng = defaultRng): T {
  return items[Math.floor(rng() * items.length)]
}

export function shuffle<T>(items: T[], rng: Rng = defaultRng): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Weighted pick. `weightOf` must return a positive number. */
export function pickWeighted<T>(items: T[], weightOf: (item: T) => number, rng: Rng = defaultRng): T {
  const weights = items.map((i) => Math.max(0.0001, weightOf(i)))
  const total = weights.reduce((a, b) => a + b, 0)
  let roll = rng() * total
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i]
    if (roll <= 0) return items[i]
  }
  return items[items.length - 1]
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
