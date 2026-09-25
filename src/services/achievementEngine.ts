import type { AchievementDef, StudentProgress, WeeklyLesson } from '../types'
import { ACHIEVEMENTS } from '../data/achievements'
import { isMastered } from './adaptiveLearning'

export function achievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

type Predicate = (p: StudentProgress, lesson: WeeklyLesson) => boolean

/**
 * One predicate per achievement id. Keeping these in a map means new badges are
 * a two-line change (add to `ACHIEVEMENTS`, add the rule here).
 */
const RULES: Record<string, Predicate> = {
  'first-win': (p) => p.sessions.length > 0 || p.completedActivities.length > 0,
  'word-warrior': (p) => p.totals.spellingCorrect >= 10,
  'spelling-master': (p, lesson) =>
    lesson.spellingWords.length > 0 &&
    lesson.spellingWords.every((w) => isMastered(p.spelling[w])),
  'math-hero': (p) => p.totals.mathCorrect >= 50,
  'combo-king': (p) => p.totals.bestCombo >= 10,
  'verse-explorer': (p) => Object.values(p.verse).some((v) => v.stagesCompleted.length > 0),
  'verse-master': (p) => Object.values(p.verse).some((v) => v.mastered),
  'on-fire': (p) => p.streak >= 5,
  'perfect-round': (p) => p.totals.perfectRounds >= 1,
  'boss-slayer': (p) => p.totals.bossesDefeated >= 1,
  'level-five': (p) => p.level >= 5,
  'coin-collector': (p) => p.coins >= 500,
  'high-scorer': (p) => p.xp >= 2000,
}

/** Returns achievements that should be unlocked right now but aren't yet. */
export function evaluateAchievements(
  progress: StudentProgress,
  lesson: WeeklyLesson,
): AchievementDef[] {
  const unlocked: AchievementDef[] = []
  for (const def of ACHIEVEMENTS) {
    if (progress.achievements.includes(def.id)) continue
    const rule = RULES[def.id]
    if (rule && rule(progress, lesson)) unlocked.push(def)
  }
  return unlocked
}

export function unlockedAchievements(progress: StudentProgress): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => progress.achievements.includes(a.id))
}

export function lockedAchievements(progress: StudentProgress): AchievementDef[] {
  return ACHIEVEMENTS.filter((a) => !progress.achievements.includes(a.id))
}
