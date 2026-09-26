import type { StudentProfile, WardrobeEquip } from '../types'

/**
 * The cosmetic subset of a `StudentProfile` that lives in the `students.avatar`
 * jsonb column. The learner's `name` lives in `students.name`; everything else
 * gameplay-related lives in `student_progress.progress`.
 */
export interface StudentCosmetics {
  avatarId: string
  backgroundId: string
  frameId: string
  badgeId: string | null
  wardrobe: WardrobeEquip
}

export function cosmeticsOf(student: StudentProfile): StudentCosmetics {
  return {
    avatarId: student.avatarId,
    backgroundId: student.backgroundId,
    frameId: student.frameId,
    badgeId: student.badgeId,
    wardrobe: student.wardrobe,
  }
}

/** Overlay remote cosmetics (if any) onto a student profile. */
export function applyCosmetics(
  student: StudentProfile,
  cosmetics: Partial<StudentCosmetics> | null | undefined,
): StudentProfile {
  if (!cosmetics) return student
  return {
    ...student,
    avatarId: cosmetics.avatarId ?? student.avatarId,
    backgroundId: cosmetics.backgroundId ?? student.backgroundId,
    frameId: cosmetics.frameId ?? student.frameId,
    badgeId: cosmetics.badgeId ?? student.badgeId,
    wardrobe: { ...student.wardrobe, ...(cosmetics.wardrobe ?? {}) },
  }
}
