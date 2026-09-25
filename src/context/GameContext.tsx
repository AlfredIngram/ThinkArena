import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  ActivityReward,
  MathTopic,
  RewardDef,
  Settings,
  SoundKind,
  StudentProfile,
  StudentProgress,
  Toast,
  WeeklyLesson,
} from '../types'
import * as storage from '../services/storage'
import * as engine from '../services/gameEngine'
import { levelInfo } from '../services/xpEngine'
import { getDailyMissions } from '../services/missionEngine'
import { playSound } from '../services/sound'
import { rewardById } from '../data/rewards'
import { uid } from '../utils/random'

interface CelebrationState {
  id: string
  level: number
}

interface GameContextValue {
  student: StudentProfile
  lesson: WeeklyLesson
  progress: StudentProgress
  settings: Settings
  level: ReturnType<typeof levelInfo>
  dailyMissions: ReturnType<typeof getDailyMissions>
  toasts: Toast[]
  celebration: CelebrationState | null
  dismissCelebration: () => void

  buzz: (kind: SoundKind) => void

  // Scored actions - each returns a summary so the UI can react immediately.
  recordSpellingAttempt: (word: string, correct: boolean) => ActivityReward
  recordMathAttempt: (category: MathTopic, correct: boolean) => ActivityReward
  recordVerseStage: (
    reference: string,
    stage: number,
    correct: boolean,
    mastered?: boolean,
  ) => ActivityReward
  recordSession: (input: engine.SessionInput) => ActivityReward
  awardBonus: (xp: number, coins: number) => ActivityReward
  markCheckpoint: (checkpointId: string) => ActivityReward

  // Rewards / cosmetics
  purchaseReward: (reward: RewardDef) => { ok: boolean; reason?: 'owned' | 'poor' }
  equipReward: (rewardId: string) => void

  // Parent mode
  saveStudent: (partial: Partial<StudentProfile>) => void
  saveLesson: (lesson: WeeklyLesson) => void
  updateLesson: (partial: Partial<WeeklyLesson>) => void
  updateSettings: (partial: Partial<Settings>) => void
  resetProgress: () => void
  resetEverything: () => void
  /** Clears this week's activity data but keeps XP, coins, and trophies. */
  resetWeek: () => void
  /** Saves a new lesson and rolls the week forward. */
  startNewWeek: (lesson: WeeklyLesson) => void
}

const GameContext = createContext<GameContextValue | null>(null)

const XP_MESSAGES = ['NICE JOB!', 'YOU GOT IT!', 'GREAT WORK!', 'KEEP GOING!', 'AMAZING!']

export function GameProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<StudentProfile>(() => storage.getStudent())
  const [lesson, setLesson] = useState<WeeklyLesson>(() => storage.getWeeklyLesson())
  const [progress, setProgress] = useState<StudentProgress>(() => storage.getProgress())
  const [toasts, setToasts] = useState<Toast[]>([])
  const [celebration, setCelebration] = useState<CelebrationState | null>(null)

  // Refs keep the latest values available inside synchronous action callbacks.
  const progressRef = useRef(progress)
  const lessonRef = useRef(lesson)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])
  useEffect(() => {
    lessonRef.current = lesson
  }, [lesson])

  const settings = progress.settings

  const buzz = useCallback((kind: SoundKind) => {
    if (progressRef.current.settings.sound) playSound(kind)
  }, [])

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = uid('toast')
    setToasts((prev) => [...prev.slice(-4), { ...toast, id }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2600)
  }, [])

  /** Central handler that turns an engine reward into visible feedback. */
  const handleReward = useCallback(
    (reward: ActivityReward, opts: { quiet?: boolean } = {}) => {
      if (reward.xpGained > 0) {
        pushToast({
          label: `+${reward.xpGained} XP`,
          tone: 'xp',
          icon: '⭐',
        })
      }
      if (reward.coinsGained > 0) {
        pushToast({
          label: `+${reward.coinsGained} coins`,
          tone: 'coin',
          icon: '🪙',
        })
      }
      for (const mission of reward.completedMissions) {
        pushToast({ label: `Mission complete: ${mission.title}`, tone: 'success', icon: '✅' })
      }
      for (const achievement of reward.unlockedAchievements) {
        pushToast({ label: `Achievement: ${achievement.title}`, tone: 'achievement', icon: achievement.icon })
      }
      if (reward.unlockedAchievements.length > 0) buzz('achievement')

      if (reward.leveledUp) {
        setCelebration({ id: uid('celebrate'), level: reward.newLevel })
        buzz('levelUp')
      }
    },
    [buzz, pushToast],
  )

  /** Run a pure engine transform, persist it, and surface the feedback. */
  const apply = useCallback(
    (
      fn: (prev: StudentProgress, lesson: WeeklyLesson) => engine.EngineResult,
      opts: { quiet?: boolean } = {},
    ): ActivityReward => {
      const result = fn(progressRef.current, lessonRef.current)
      progressRef.current = result.next
      setProgress(result.next)
      storage.saveProgress(result.next)
      handleReward(result.reward, opts)
      return result.reward
    },
    [handleReward],
  )

  // --- Actions -----------------------------------------------------------

  const recordSpellingAttempt = useCallback(
    (word: string, correct: boolean) =>
      apply((prev, l) => engine.recordSpellingAttempt(prev, l, word, correct)),
    [apply],
  )

  const recordMathAttempt = useCallback(
    (category: MathTopic, correct: boolean) =>
      apply((prev, l) => engine.recordMathAttempt(prev, l, category, correct)),
    [apply],
  )

  const recordVerseStage = useCallback(
    (reference: string, stage: number, correct: boolean, mastered = false) =>
      apply((prev, l) => engine.recordVerseStage(prev, l, reference, stage, correct, mastered), {
        quiet: true,
      }),
    [apply],
  )

  const recordSession = useCallback(
    (input: engine.SessionInput) => apply((prev, l) => engine.recordSession(prev, l, input)),
    [apply],
  )

  const awardBonus = useCallback(
    (xp: number, coins: number) => apply((prev, l) => engine.awardBonus(prev, l, xp, coins)),
    [apply],
  )

  const markCheckpoint = useCallback(
    (checkpointId: string) => apply((prev, l) => engine.markCheckpoint(prev, l, checkpointId)),
    [apply],
  )

  const purchaseReward = useCallback(
    (reward: RewardDef) => {
      const current = progressRef.current
      const result = engine.purchaseReward(current, reward)
      if (result.ok) {
        progressRef.current = result.next
        setProgress(result.next)
        storage.saveProgress(result.next)
        buzz('coin')
        pushToast({ label: `Unlocked ${reward.name}!`, tone: 'success', icon: '🎁' })
      }
      return { ok: result.ok, reason: result.reason }
    },
    [buzz, pushToast],
  )

  const equipReward = useCallback(
    (rewardId: string) => {
      const reward = rewardById(rewardId)
      if (!reward) return
      setStudent((prev) => {
        const next: StudentProfile = { ...prev }
        if (reward.category === 'avatar') next.avatarId = reward.id
        if (reward.category === 'background') next.backgroundId = reward.id
        if (reward.category === 'frame') next.frameId = reward.id
        if (reward.category === 'badge') next.badgeId = reward.id
        storage.saveStudent(next)
        return next
      })
      buzz('click')
    },
    [buzz],
  )

  const saveStudent = useCallback((partial: Partial<StudentProfile>) => {
    setStudent((prev) => {
      const next = { ...prev, ...partial }
      storage.saveStudent(next)
      return next
    })
  }, [])

  const saveLesson = useCallback((next: WeeklyLesson) => {
    lessonRef.current = next
    setLesson(next)
    storage.saveWeeklyLesson(next)
  }, [])

  const updateLesson = useCallback(
    (partial: Partial<WeeklyLesson>) => {
      const next = { ...lessonRef.current, ...partial }
      lessonRef.current = next
      setLesson(next)
      storage.saveWeeklyLesson(next)
    },
    [],
  )

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      const next = { ...progressRef.current.settings, ...partial }
      const updated = { ...progressRef.current, settings: next }
      progressRef.current = updated
      setProgress(updated)
      storage.saveProgress(updated)
    },
    [],
  )

  const resetProgress = useCallback(() => {
    const fresh = storage.resetProgress()
    progressRef.current = fresh
    setProgress(fresh)
  }, [])

  const resetEverything = useCallback(() => {
    storage.resetEverything()
    const s = storage.getStudent()
    const l = storage.getWeeklyLesson()
    const p = storage.getProgress()
    setStudent(s)
    lessonRef.current = l
    setLesson(l)
    progressRef.current = p
    setProgress(p)
  }, [])

  const resetWeek = useCallback(() => {
    const next = engine.resetWeek(progressRef.current)
    progressRef.current = next
    setProgress(next)
    storage.saveProgress(next)
  }, [])

  const startNewWeek = useCallback(
    (nextLesson: WeeklyLesson) => {
      lessonRef.current = nextLesson
      setLesson(nextLesson)
      storage.saveWeeklyLesson(nextLesson)
      const next = engine.resetWeek(progressRef.current)
      progressRef.current = next
      setProgress(next)
      storage.saveProgress(next)
    },
    [],
  )

  const value = useMemo<GameContextValue>(
    () => ({
      student,
      lesson,
      progress,
      settings,
      level: levelInfo(progress.xp),
      dailyMissions: getDailyMissions(lesson),
      toasts,
      celebration,
      dismissCelebration: () => setCelebration(null),
      buzz,
      recordSpellingAttempt,
      recordMathAttempt,
      recordVerseStage,
      recordSession,
      awardBonus,
      markCheckpoint,
      purchaseReward,
      equipReward,
      saveStudent,
      saveLesson,
      updateLesson,
      updateSettings,
      resetProgress,
      resetEverything,
      resetWeek,
      startNewWeek,
    }),
    [
      student,
      lesson,
      progress,
      settings,
      toasts,
      celebration,
      buzz,
      recordSpellingAttempt,
      recordMathAttempt,
      recordVerseStage,
      recordSession,
      awardBonus,
      markCheckpoint,
      purchaseReward,
      equipReward,
      saveStudent,
      saveLesson,
      updateLesson,
      updateSettings,
      resetProgress,
      resetEverything,
      resetWeek,
      startNewWeek,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}

export { XP_MESSAGES }
export type { CelebrationState }
