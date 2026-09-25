import type {
  ActivityReward,
  ActivitySession,
  MathCategoryStats,
  MathTopic,
  MissionDef,
  RewardDef,
  StudentProgress,
  VerseStats,
  WeeklyLesson,
} from '../types'
import { COINS, XP, levelFromXp, streakBonusCoins, streakBonusXp } from './xpEngine'
import { evaluateAchievements } from './achievementEngine'
import { missionsReadyToClaim, rollMissionsIfNeeded } from './missionEngine'
import { todayKey, weekKey, yesterdayKey } from '../utils/date'
import { uid } from '../utils/random'
import { createEmptyMissions, createEmptyWeekly } from '../data/defaults'

/**
 * Pure game engine.
 *
 * Every function here takes the current progress, returns the next progress and
 * a summary of what the player earned. No React, no storage, no side effects -
 * which makes the XP/mission/achievement rules easy to test and reuse.
 */

export interface EngineResult {
  next: StudentProgress
  reward: ActivityReward
}

interface Payout {
  xp: number
  coins: number
}

/** Parent reward multiplier + coins-per-correct scaling. */
export function scaleCoins(coins: number, lesson: WeeklyLesson): number {
  const cfg = lesson.reward ?? { coinsPerCorrect: COINS.correct, multiplier: 1 }
  const perCorrect = cfg.coinsPerCorrect / COINS.correct
  return Math.round(coins * (cfg.multiplier ?? 1) * perCorrect)
}

function emptyReward(correct: boolean): ActivityReward {
  return {
    xpGained: 0,
    coinsGained: 0,
    leveledUp: false,
    newLevel: 1,
    unlockedAchievements: [],
    completedMissions: [],
    correct,
  }
}

/** Reset weekly counters when a new week starts (Monday). */
function rollWeek(
  weekly: StudentProgress['weekly'],
  week: string,
): StudentProgress['weekly'] {
  if (weekly.weekOf === week) return weekly
  return { weekOf: week, spellingCorrect: 0, mathCorrect: 0, verseStages: 0, xp: 0, coins: 0 }
}

/** Update the streak on the first activity of a new day and pay a bonus. */
function touchStreak(progress: StudentProgress): { next: StudentProgress; bonus: Payout } {
  const today = todayKey()
  if (progress.lastStudyDate === today) return { next: progress, bonus: { xp: 0, coins: 0 } }

  const continuing = progress.lastStudyDate === yesterdayKey()
  const streak = continuing ? progress.streak + 1 : 1
  return {
    next: {
      ...progress,
      streak,
      longestStreak: Math.max(progress.longestStreak, streak),
      lastStudyDate: today,
    },
    bonus: continuing
      ? { xp: streakBonusXp(streak), coins: streakBonusCoins(streak) }
      : { xp: 0, coins: 0 },
  }
}

/**
 * Shared tail for every scored action:
 * apply payout -> streak -> daily missions -> achievements -> level recalc.
 */
function finalize(prev: StudentProgress, lesson: WeeklyLesson, payout: Payout, correct: boolean): EngineResult {
  let work: StudentProgress = {
    ...prev,
    xp: prev.xp + payout.xp,
    coins: prev.coins + scaleCoins(payout.coins, lesson),
  }

  work.missions = rollMissionsIfNeeded(work.missions, todayKey())
  work.weekly = rollWeek(work.weekly, weekKey())

  const { next: streaked, bonus } = touchStreak(work)
  work = {
    ...streaked,
    xp: streaked.xp + bonus.xp,
    coins: streaked.coins + scaleCoins(bonus.coins, lesson),
  }

  // Daily missions that just became complete.
  const completedMissions: MissionDef[] = []
  for (const mission of missionsReadyToClaim(work.missions, lesson)) {
    work = {
      ...work,
      missions: { ...work.missions, claimed: [...work.missions.claimed, mission.id] },
      xp: work.xp + mission.xp,
      coins: work.coins + scaleCoins(mission.coins, lesson),
    }
    completedMissions.push(mission)
  }

  // Newly earned achievements.
  const unlocked = evaluateAchievements(work, lesson)
  if (unlocked.length > 0) {
    work = {
      ...work,
      achievements: [...work.achievements, ...unlocked.map((a) => a.id)],
      xp: work.xp + unlocked.length * XP.achievement,
      coins: work.coins + unlocked.length * scaleCoins(COINS.achievement, lesson),
    }
  }

  const newLevel = levelFromXp(work.xp)
  work = {
    ...work,
    level: newLevel,
    // Weekly totals capture everything earned in this action, including bonuses.
    weekly: {
      ...work.weekly,
      xp: work.weekly.xp + (work.xp - prev.xp),
      coins: work.weekly.coins + (work.coins - prev.coins),
    },
  }

  return {
    next: work,
    reward: {
      xpGained: work.xp - prev.xp,
      coinsGained: work.coins - prev.coins,
      leveledUp: newLevel > prev.level,
      newLevel,
      unlockedAchievements: unlocked,
      completedMissions,
      correct,
    },
  }
}

// --- Spelling ------------------------------------------------------------

export function recordSpellingAttempt(
  prev: StudentProgress,
  lesson: WeeklyLesson,
  word: string,
  correct: boolean,
): EngineResult {
  const key = word.trim().toLowerCase()
  const prior = prev.spelling[key] ?? {
    word: key,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    mastery: 0,
  }
  const attempts = prior.attempts + 1
  const correctCount = prior.correct + (correct ? 1 : 0)

  const stats = {
    word: key,
    attempts,
    correct: correctCount,
    incorrect: attempts - correctCount,
    mastery: Math.round((correctCount / attempts) * 100),
  }

  const base: StudentProgress = {
    ...prev,
    spelling: { ...prev.spelling, [key]: stats },
    weekly: { ...prev.weekly, spellingCorrect: prev.weekly.spellingCorrect + (correct ? 1 : 0) },
    totals: {
      ...prev.totals,
      correct: prev.totals.correct + (correct ? 1 : 0),
      incorrect: prev.totals.incorrect + (correct ? 0 : 1),
      spellingCorrect: prev.totals.spellingCorrect + (correct ? 1 : 0),
    },
    missions: {
      ...prev.missions,
      spellingCorrect: prev.missions.spellingCorrect + (correct ? 1 : 0),
    },
  }

  const payout = correct ? { xp: XP.correct, coins: COINS.correct } : { xp: 0, coins: 0 }
  return finalize(base, lesson, payout, correct)
}

// --- Math ----------------------------------------------------------------

export function recordMathAttempt(
  prev: StudentProgress,
  lesson: WeeklyLesson,
  category: MathTopic,
  correct: boolean,
): EngineResult {
  const prior: MathCategoryStats = prev.math[category] ?? {
    category,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    accuracy: 0,
  }
  const attempts = prior.attempts + 1
  const correctCount = prior.correct + (correct ? 1 : 0)

  const stats: MathCategoryStats = {
    category,
    attempts,
    correct: correctCount,
    incorrect: attempts - correctCount,
    accuracy: Math.round((correctCount / attempts) * 100),
  }

  const base: StudentProgress = {
    ...prev,
    math: { ...prev.math, [category]: stats },
    weekly: { ...prev.weekly, mathCorrect: prev.weekly.mathCorrect + (correct ? 1 : 0) },
    totals: {
      ...prev.totals,
      correct: prev.totals.correct + (correct ? 1 : 0),
      incorrect: prev.totals.incorrect + (correct ? 0 : 1),
      mathCorrect: prev.totals.mathCorrect + (correct ? 1 : 0),
    },
    missions: {
      ...prev.missions,
      mathCorrect: prev.missions.mathCorrect + (correct ? 1 : 0),
    },
  }

  const payout = correct ? { xp: XP.correct, coins: COINS.correct } : { xp: 0, coins: 0 }
  return finalize(base, lesson, payout, correct)
}

// --- Bible verse ---------------------------------------------------------

export function recordVerseStage(
  prev: StudentProgress,
  lesson: WeeklyLesson,
  reference: string,
  stage: number,
  correct: boolean,
  mastered = false,
): EngineResult {
  const prior: VerseStats = prev.verse[reference] ?? {
    reference,
    stagesCompleted: [],
    mastered: false,
    attempts: 0,
    correct: 0,
  }

  const stats: VerseStats = {
    ...prior,
    attempts: prior.attempts + 1,
    correct: prior.correct + (correct ? 1 : 0),
    stagesCompleted:
      correct && !prior.stagesCompleted.includes(stage)
        ? [...prior.stagesCompleted, stage].sort((a, b) => a - b)
        : prior.stagesCompleted,
    mastered: prior.mastered || mastered,
  }

  const justMastered = mastered && !prior.mastered

  const base: StudentProgress = {
    ...prev,
    verse: { ...prev.verse, [reference]: stats },
    weekly: { ...prev.weekly, verseStages: prev.weekly.verseStages + (correct ? 1 : 0) },
    totals: {
      ...prev.totals,
      correct: prev.totals.correct + (correct ? 1 : 0),
      incorrect: prev.totals.incorrect + (correct ? 0 : 1),
    },
    missions: { ...prev.missions, versePractice: prev.missions.versePractice + 1 },
  }

  const payout: Payout = correct
    ? {
        xp: XP.verseStage + (justMastered ? XP.verseMastered : 0),
        coins: COINS.verseStage + (justMastered ? COINS.verseMastered : 0),
      }
    : { xp: 0, coins: 0 }

  return finalize(base, lesson, payout, correct)
}

// --- Round / session ends ------------------------------------------------

export interface SessionInput {
  kind: ActivitySession['kind']
  mode: string
  correct: number
  total: number
  bestCombo?: number
  bossDefeated?: boolean
}

/**
 * Called at the end of a round. Handles perfect-round bonuses, combo records,
 * boss kills, and stores the session for the parent dashboard.
 */
export function recordSession(
  prev: StudentProgress,
  lesson: WeeklyLesson,
  input: SessionInput,
): EngineResult {
  const perfect = input.total > 0 && input.correct === input.total
  const bestCombo = Math.max(prev.totals.bestCombo, input.bestCombo ?? 0)

  let xp = perfect ? XP.perfectRound : 0
  let coins = perfect ? COINS.perfectRound : 0
  if (input.bossDefeated) {
    xp += XP.bossDefeat
    coins += COINS.bossDefeat
  }

  const scaledCoins = scaleCoins(coins, lesson)

  const session: ActivitySession = {
    id: uid('sess'),
    kind: input.kind,
    mode: input.mode,
    correct: input.correct,
    total: input.total,
    xpGained: xp,
    coinsGained: scaledCoins,
    at: new Date().toISOString(),
  }

  const base: StudentProgress = {
    ...prev,
    totals: {
      ...prev.totals,
      perfectRounds: prev.totals.perfectRounds + (perfect ? 1 : 0),
      bestCombo,
      bossesDefeated: prev.totals.bossesDefeated + (input.bossDefeated ? 1 : 0),
    },
    sessions: [session, ...prev.sessions].slice(0, 60),
  }

  return finalize(base, lesson, { xp, coins }, true)
}

// --- Misc rewards --------------------------------------------------------

/** Generic XP/coin grant (weekly checkpoints, parent bonuses, etc). */
export function awardBonus(
  prev: StudentProgress,
  lesson: WeeklyLesson,
  xp: number,
  coins: number,
): EngineResult {
  return finalize(prev, lesson, { xp, coins }, true)
}

/** Mark a weekly-map checkpoint done and pay the checkpoint bonus once. */
export function markCheckpoint(
  prev: StudentProgress,
  lesson: WeeklyLesson,
  checkpointId: string,
): EngineResult {
  if (prev.weeklyCheckpoints.includes(checkpointId)) {
    return { next: prev, reward: emptyReward(true) }
  }
  const base: StudentProgress = {
    ...prev,
    weeklyCheckpoints: [...prev.weeklyCheckpoints, checkpointId],
  }
  return finalize(base, lesson, { xp: XP.checkpoint, coins: 40 }, true)
}

/** Clear this week's activity data (keeps XP, coins, level, and achievements). */
export function resetWeek(prev: StudentProgress): StudentProgress {
  return {
    ...prev,
    spelling: {},
    math: {},
    verse: {},
    weeklyCheckpoints: [],
    weekly: createEmptyWeekly(),
    missions: createEmptyMissions(),
  }
}

/** Completion bookkeeping for activity ids (used by the weekly map). */
export function completeActivity(prev: StudentProgress, activityId: string): StudentProgress {
  if (prev.completedActivities.includes(activityId)) return prev
  return { ...prev, completedActivities: [...prev.completedActivities, activityId] }
}

export interface PurchaseResult {
  next: StudentProgress
  ok: boolean
  reason?: 'owned' | 'poor'
}

export function purchaseReward(
  prev: StudentProgress,
  reward: RewardDef,
): PurchaseResult {
  if (prev.rewards.includes(reward.id)) return { next: prev, ok: false, reason: 'owned' }
  if (prev.coins < reward.cost) return { next: prev, ok: false, reason: 'poor' }
  return {
    next: { ...prev, coins: prev.coins - reward.cost, rewards: [...prev.rewards, reward.id] },
    ok: true,
  }
}
