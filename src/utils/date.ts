/** Date helpers. Everything is stored as a local `YYYY-MM-DD` key. */

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return dateKey(new Date())
}

export function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dateKey(d)
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`).getTime()
  const db = new Date(`${b}T00:00:00`).getTime()
  return Math.round((db - da) / 86_400_000)
}

/** Monday-based day index: 0 = Mon ... 6 = Sun. */
export function weekDayIndex(d: Date = new Date()): number {
  return (d.getDay() + 6) % 7
}

export const WEEK_DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const

/** Key for the Monday of the week containing `d`. Used to roll weekly stats. */
export function weekKey(d: Date = new Date()): string {
  const copy = new Date(d)
  copy.setDate(copy.getDate() - weekDayIndex(copy))
  return dateKey(copy)
}
