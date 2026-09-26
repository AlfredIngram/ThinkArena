import type {
  DifficultyLevel,
  LongGoals,
  MathSettings,
  MissionProgress,
  Settings,
  StudentProfile,
  StudentProgress,
  WardrobeEquip,
  WeeklyGoals,
  WeeklyLesson,
  WeeklyProgress,
} from '../types'
import { todayKey, weekKey } from '../utils/date'
import { DEFAULT_OWNED_WARDROBE, DEFAULT_WARDROBE } from './wardrobe'

export const STORAGE_VERSION = 1
export const DEFAULT_PARENT_PIN = '1234'

/** Demo spelling list shipped with the app. */
export const DEFAULT_SPELLING_WORDS = [
  'because',
  'friend',
  'people',
  'different',
  'favorite',
  'another',
  'important',
  'example',
  'family',
  'school',
]

/** Public-domain KJV text. */
export const DEFAULT_VERSE = {
  reference: 'John 3:16',
  text:
    'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
}

export const DEFAULT_MATH: MathSettings = {
  topics: ['addition', 'subtraction', 'multiplication'],
  difficulty: 2,
}

export const DEFAULT_GOALS: WeeklyGoals = {
  spellingWordsGoal: 10,
  mathProblemsGoal: 15,
  versePracticeGoal: 2,
  weeklyXpGoal: 1500,
}

/** Sensible starting targets for the longer horizons (~4 weeks/month). */
export const DEFAULT_LONG_GOALS: LongGoals = {
  monthlyXpGoal: 6000,
  monthlyCorrectGoal: 200,
  yearlyXpGoal: 60000,
  yearlyCorrectGoal: 2000,
}

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  music: false,
  animations: true,
  reducedMotion: false,
}

export function createStudent(name = 'Player One'): StudentProfile {
  return {
    id: 'student_local',
    name,
    avatarId: 'avatar-astro',
    backgroundId: 'bg-nebula',
    frameId: 'frame-basic',
    badgeId: null,
    wardrobe: { ...DEFAULT_WARDROBE },
    pin: DEFAULT_PARENT_PIN,
    createdAt: new Date().toISOString(),
  }
}

export function createWardrobe(): WardrobeEquip {
  return { ...DEFAULT_WARDROBE }
}

export function createLesson(): WeeklyLesson {
  return {
    weekOf: todayKey(),
    spellingWords: [...DEFAULT_SPELLING_WORDS],
    bibleVerse: { ...DEFAULT_VERSE },
    math: { ...DEFAULT_MATH, topics: [...DEFAULT_MATH.topics] },
    goals: { ...DEFAULT_GOALS },
    longGoals: { ...DEFAULT_LONG_GOALS },
    reward: { coinsPerCorrect: 5, multiplier: 1 },
  }
}

export function createEmptyMissions(): MissionProgress {
  return {
    date: todayKey(),
    spellingCorrect: 0,
    mathCorrect: 0,
    versePractice: 0,
    claimed: [],
  }
}

export function createEmptyWeekly(): WeeklyProgress {
  return {
    weekOf: weekKey(),
    spellingCorrect: 0,
    mathCorrect: 0,
    verseStages: 0,
    xp: 0,
    coins: 0,
  }
}

export function createProgress(): StudentProgress {
  return {
    xp: 0,
    level: 1,
    coins: 50,
    streak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    completedActivities: [],
    weeklyCheckpoints: [],
    spelling: {},
    math: {},
    verse: {},
    achievements: [],
    rewards: ['avatar-astro', 'bg-nebula', 'frame-basic', ...DEFAULT_OWNED_WARDROBE],
    missions: createEmptyMissions(),
    weekly: createEmptyWeekly(),
    history: [],
    totals: {
      correct: 0,
      incorrect: 0,
      spellingCorrect: 0,
      mathCorrect: 0,
      perfectRounds: 0,
      bestCombo: 0,
      bossesDefeated: 0,
    },
    sessions: [],
    settings: { ...DEFAULT_SETTINGS },
  }
}

export const DEFAULT_DIFFICULTY: DifficultyLevel = 2
