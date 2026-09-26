import type { Settings, StudentProfile, StudentProgress, WeeklyLesson } from '../types'
import { createLesson, createProgress, createStudent, createEmptyWeekly, STORAGE_VERSION } from '../data/defaults'
import { DEFAULT_OWNED_WARDROBE } from '../data/wardrobe'
import { todayKey, weekKey } from '../utils/date'
import { rollMissionsIfNeeded } from './missionEngine'

/**
 * Storage service - the ONLY place that knows about persistence.
 *
 * Swapping localStorage for Supabase later means implementing the same four
 * functions against the remote adapter in `services/supabase.ts`.
 */

const KEYS = {
  version: 'lul.version',
  student: 'lul.student',
  lesson: 'lul.lesson',
  progress: 'lul.progress',
} as const

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Quota or private-mode failures shouldn't break gameplay. */
  }
}

export function getStudent(): StudentProfile {
  const base = createStudent()
  const stored = read<Partial<StudentProfile>>(KEYS.student)
  if (!stored) {
    write(KEYS.student, base)
    return base
  }
  // Merge over defaults so newly-added fields (e.g. wardrobe) never go missing.
  return {
    ...base,
    ...stored,
    wardrobe: { ...base.wardrobe, ...(stored.wardrobe ?? {}) },
  }
}

export function saveStudent(student: StudentProfile): void {
  write(KEYS.student, student)
}

export function getWeeklyLesson(): WeeklyLesson {
  const base = createLesson()
  const stored = read<Partial<WeeklyLesson>>(KEYS.lesson)
  if (!stored) {
    write(KEYS.lesson, base)
    return base
  }
  return {
    ...base,
    ...stored,
    bibleVerse: { ...base.bibleVerse, ...(stored.bibleVerse ?? {}) },
    math: { ...base.math, ...(stored.math ?? {}) },
    goals: { ...base.goals, ...(stored.goals ?? {}) },
    longGoals: { ...base.longGoals, ...(stored.longGoals ?? {}) },
    reward: { ...base.reward, ...(stored.reward ?? {}) },
  }
}

export function saveWeeklyLesson(lesson: WeeklyLesson): void {
  write(KEYS.lesson, lesson)
}

/** Merge stored progress over a fresh default so new fields never go missing. */
function hydrate(stored: Partial<StudentProgress> | null): StudentProgress {
  const base = createProgress()
  if (!stored) return base
  return {
    ...base,
    ...stored,
    totals: { ...base.totals, ...(stored.totals ?? {}) },
    settings: { ...base.settings, ...(stored.settings ?? {}) },
    missions: { ...base.missions, ...(stored.missions ?? {}) },
    weekly: stored.weekly && stored.weekly.weekOf === weekKey() ? stored.weekly : createEmptyWeekly(),
    spelling: stored.spelling ?? {},
    math: stored.math ?? {},
    verse: stored.verse ?? {},
    history: stored.history ?? base.history,
    // Free wardrobe items are always owned, even for progress saved before the
    // wardrobe shipped.
    rewards: Array.from(new Set([...(stored.rewards ?? base.rewards), ...DEFAULT_OWNED_WARDROBE])),
  }
}

export function getProgress(): StudentProgress {
  const stored = read<StudentProgress>(KEYS.progress)
  const progress = hydrate(stored)
  // Roll daily missions forward if the app was last opened on an earlier day.
  progress.missions = rollMissionsIfNeeded(progress.missions, todayKey())
  return progress
}

export function saveProgress(progress: StudentProgress): void {
  write(KEYS.progress, progress)
}

export function updateSettings(settings: Settings): Settings {
  const progress = getProgress()
  progress.settings = settings
  saveProgress(progress)
  return settings
}

export function exportAll() {
  return {
    student: getStudent(),
    lesson: getWeeklyLesson(),
    progress: getProgress(),
  }
}

/** Wipe everything and restore the shipped demo content. */
export function resetProgress(): StudentProgress {
  const fresh = createProgress()
  saveProgress(fresh)
  return fresh
}

export function resetEverything(): void {
  resetProgress()
  saveStudent(createStudent())
  saveWeeklyLesson(createLesson())
  write(KEYS.version, STORAGE_VERSION)
}
