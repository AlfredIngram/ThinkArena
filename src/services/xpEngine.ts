import type { LevelInfo } from '../types'

/** XP payouts for every meaningful event in the game. */
export const XP = {
  correct: 10,
  bossHit: 15,
  perfectRound: 50,
  dailyMission: 75,
  weeklyMission: 250,
  verseStage: 40,
  verseMastered: 150,
  bossDefeat: 200,
  checkpoint: 60,
  achievement: 100,
} as const

/** Coin payouts. `coinsPerCorrect` in the weekly lesson scales these. */
export const COINS = {
  correct: 5,
  perfectRound: 25,
  dailyMission: 30,
  weeklyMission: 100,
  verseStage: 15,
  verseMastered: 75,
  bossDefeat: 100,
  achievement: 50,
} as const

/**
 * Progressive level curve: each level costs more than the last.
 * L1→L2 = 100 XP, L2→L3 = 150 XP, L3→L4 = 200 XP, ...
 */
export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 50
}

export function levelInfo(totalXp: number): LevelInfo {
  let level = 1
  let remaining = Math.max(0, totalXp)
  // Guard against absurd loops if data ever gets corrupted.
  while (remaining >= xpForLevel(level) && level < 999) {
    remaining -= xpForLevel(level)
    level++
  }
  const needed = xpForLevel(level)
  return {
    level,
    current: remaining,
    needed,
    percent: Math.min(100, Math.round((remaining / needed) * 100)),
  }
}

export function levelFromXp(totalXp: number): number {
  return levelInfo(totalXp).level
}

/** Bonus XP for keeping a streak alive (capped so it stays fair). */
export function streakBonusXp(streak: number): number {
  return Math.min(streak, 10) * 10
}

export function streakBonusCoins(streak: number): number {
  return Math.min(streak, 10) * 2
}
