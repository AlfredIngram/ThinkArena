import type { MissionDef, MissionProgress, WeeklyLesson } from '../types'

/**
 * Daily missions are derived from the parent's weekly goals, so changing goals
 * in Parent Mode immediately changes the student's mission board.
 */
export function getDailyMissions(lesson: WeeklyLesson): MissionDef[] {
  return [
    {
      id: 'daily-spelling',
      title: `Get ${lesson.goals.spellingWordsGoal} spelling words correct`,
      icon: 'SpellCheck',
      target: lesson.goals.spellingWordsGoal,
      metric: 'spellingCorrect',
      xp: 75,
      coins: 30,
    },
    {
      id: 'daily-math',
      title: `Complete ${lesson.goals.mathProblemsGoal} math problems`,
      icon: 'Swords',
      target: lesson.goals.mathProblemsGoal,
      metric: 'mathCorrect',
      xp: 75,
      coins: 30,
    },
    {
      id: 'daily-verse',
      title: `Practice the Bible verse ${lesson.goals.versePracticeGoal} times`,
      icon: 'BookOpen',
      target: lesson.goals.versePracticeGoal,
      metric: 'versePractice',
      xp: 75,
      coins: 30,
    },
  ]
}

export function missionProgressValue(progress: MissionProgress, mission: MissionDef): number {
  return progress[mission.metric]
}

export function isMissionComplete(progress: MissionProgress, mission: MissionDef): boolean {
  return missionProgressValue(progress, mission) >= mission.target
}

/** Missions that are finished but haven't paid out yet. */
export function missionsReadyToClaim(
  progress: MissionProgress,
  lesson: WeeklyLesson,
): MissionDef[] {
  return getDailyMissions(lesson).filter(
    (m) => isMissionComplete(progress, m) && !progress.claimed.includes(m.id),
  )
}

/** Reset counters when the calendar day rolls over. */
export function rollMissionsIfNeeded(progress: MissionProgress, today: string): MissionProgress {
  if (progress.date === today) return progress
  return { date: today, spellingCorrect: 0, mathCorrect: 0, versePractice: 0, claimed: [] }
}
