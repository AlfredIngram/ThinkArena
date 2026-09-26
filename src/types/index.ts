/**
 * Core domain types for Level Up Learning.
 *
 * Everything the student earns or completes lives in `StudentProgress`, which is
 * persisted through the storage service. Keeping this shape serialization-friendly
 * means the same objects can be dropped into Supabase tables later.
 */

export type MathTopic =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'wordProblems'
  | 'mixed'

export type DifficultyLevel = 1 | 2 | 3 | 4

export interface Settings {
  sound: boolean
  music: boolean
  animations: boolean
  reducedMotion: boolean
}

export interface StudentProfile {
  id: string
  name: string
  avatarId: string
  backgroundId: string
  frameId: string
  badgeId: string | null
  /** Layered cosmetic loadout, keyed by wardrobe slot. */
  wardrobe: WardrobeEquip
  pin: string
  createdAt: string
}

/** Sparse stats for one spelling word. */
export interface SpellingWordStats {
  word: string
  attempts: number
  correct: number
  incorrect: number
  /** 0-100, derived but stored so parent dashboards are cheap to render. */
  mastery: number
}

export interface MathCategoryStats {
  category: MathTopic
  attempts: number
  correct: number
  incorrect: number
  accuracy: number
}

export interface VerseStats {
  reference: string
  /** Stage ids (1-6) that have been completed. */
  stagesCompleted: number[]
  mastered: boolean
  attempts: number
  correct: number
}

export interface Totals {
  correct: number
  incorrect: number
  spellingCorrect: number
  mathCorrect: number
  perfectRounds: number
  bestCombo: number
  bossesDefeated: number
}

export interface MissionProgress {
  /** YYYY-MM-DD the counters below belong to (missions reset daily). */
  date: string
  spellingCorrect: number
  mathCorrect: number
  versePractice: number
  claimed: string[]
}

/** Counters that reset each Monday so "weekly progress" is real, not guessed. */
export interface WeeklyProgress {
  /** Monday of the week these counters belong to. */
  weekOf: string
  spellingCorrect: number
  mathCorrect: number
  verseStages: number
  xp: number
  coins: number
}

/** One day of activity. The append-only timeline that powers monthly,
 *  yearly, and heatmap views (weekly counters stay as the fast path). */
export interface DailyRecord {
  /** YYYY-MM-DD (local). */
  date: string
  xp: number
  coins: number
  correct: number
  spellingCorrect: number
  mathCorrect: number
  verseStages: number
}

/** Aggregated activity over any window (week / month / year). */
export interface TimeframeTotals {
  xp: number
  coins: number
  correct: number
  spellingCorrect: number
  mathCorrect: number
  verseStages: number
  /** Days with at least one logged activity. */
  daysActive: number
}

export interface BibleVerse {
  reference: string
  text: string
}

export interface MathSettings {
  topics: MathTopic[]
  difficulty: DifficultyLevel
}

export interface WeeklyGoals {
  spellingWordsGoal: number
  mathProblemsGoal: number
  versePracticeGoal: number
  weeklyXpGoal: number
}

/** Longer-horizon targets edited in Parent Mode. */
export interface LongGoals {
  monthlyXpGoal: number
  monthlyCorrectGoal: number
  yearlyXpGoal: number
  yearlyCorrectGoal: number
}

export interface RewardSettings {
  coinsPerCorrect: number
  /** Global multiplier so parents can dial rewards up or down. */
  multiplier: number
}

export interface WeeklyLesson {
  weekOf: string
  spellingWords: string[]
  bibleVerse: BibleVerse
  math: MathSettings
  goals: WeeklyGoals
  longGoals: LongGoals
  reward: RewardSettings
}

export interface StudentProgress {
  xp: number
  level: number
  coins: number
  streak: number
  longestStreak: number
  /** YYYY-MM-DD of the last day the student studied. */
  lastStudyDate: string | null
  completedActivities: string[]
  weeklyCheckpoints: string[]
  spelling: Record<string, SpellingWordStats>
  math: Record<string, MathCategoryStats>
  verse: Record<string, VerseStats>
  achievements: string[]
  rewards: string[]
  missions: MissionProgress
  weekly: WeeklyProgress
  /** Append-only per-day timeline (capped) for month/year/heatmap views. */
  history: DailyRecord[]
  totals: Totals
  sessions: ActivitySession[]
  settings: Settings
}

export interface ActivitySession {
  id: string
  kind: 'spelling' | 'math' | 'verse'
  mode: string
  correct: number
  total: number
  xpGained: number
  coinsGained: number
  at: string
}

export interface MissionDef {
  id: string
  title: string
  icon: string
  target: number
  metric: keyof Pick<MissionProgress, 'spellingCorrect' | 'mathCorrect' | 'versePractice'>
  xp: number
  coins: number
}

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'legendary'
}

export type RewardCategory = 'avatar' | 'background' | 'frame' | 'badge' | 'pet'

// --- Wardrobe (layered avatar cosmetics) --------------------------------

export type WardrobeSlot =
  | 'base'
  | 'skin'
  | 'hair'
  | 'outfit'
  | 'accessory'
  | 'pet'
  | 'aura'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

/** Which item id is equipped in each slot. */
export type WardrobeEquip = Record<WardrobeSlot, string>

export interface WardrobeItem {
  id: string
  slot: WardrobeSlot
  name: string
  rarity: Rarity
  cost: number
  description: string
  /** Optional raster art. Drop PNGs in `public/avatars/` and set e.g. `/avatars/hero.png`. */
  image?: string
  /** Rendering hints consumed by <Avatar/>. */
  art: Record<string, string | number | boolean>
}

export interface RewardDef {
  id: string
  name: string
  category: RewardCategory
  cost: number
  /** Emoji or icon key used for the placeholder art. */
  art: string
  gradient: string
  description: string
}

/** Result of a single scored action, used to drive UI feedback. */
export interface ActivityReward {
  xpGained: number
  coinsGained: number
  leveledUp: boolean
  newLevel: number
  unlockedAchievements: AchievementDef[]
  completedMissions: MissionDef[]
  correct: boolean
}

export interface LevelInfo {
  level: number
  current: number
  needed: number
  percent: number
}

export type SoundKind =
  | 'correct'
  | 'incorrect'
  | 'xp'
  | 'coin'
  | 'achievement'
  | 'levelUp'
  | 'bossDefeated'
  | 'click'

export interface Toast {
  id: string
  label: string
  tone: 'xp' | 'coin' | 'success' | 'info' | 'achievement'
  icon?: string
}
