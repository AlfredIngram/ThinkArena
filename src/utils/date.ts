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

/** `YYYY-MM` for the month containing `d`. */
export function monthKey(d: Date = new Date()): string {
  return dateKey(d).slice(0, 7)
}

/** `YYYY` for the year containing `d`. */
export function yearKey(d: Date = new Date()): string {
  return String(d.getFullYear())
}

/** Parse a `YYYY-MM-DD` key into a local Date at midnight. */
export function parseKey(key: string): Date {
  return new Date(`${key}T00:00:00`)
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

/** Human label for a `YYYY-MM` key, e.g. "September 2026". */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${MONTH_NAMES[(m || 1) - 1]} ${y}`
}

/** First `YYYY-MM-DD` of a `YYYY-MM` month key. */
export function monthStart(key: string): string {
  return `${key}-01`
}

/** Last `YYYY-MM-DD` of a `YYYY-MM` month key. */
export function monthEnd(key: string): string {
  const [y, m] = key.split('-').map(Number)
  const last = new Date(y, m, 0)
  return dateKey(last)
}

/** Inclusive list of `YYYY-MM-DD` keys covering a month. */
export function daysInMonth(key: string): string[] {
  const [y, m] = key.split('-').map(Number)
  const count = new Date(y, m, 0).getDate()
  const out: string[] = []
  for (let day = 1; day <= count; day++) {
    out.push(`${key}-${String(day).padStart(2, '0')}`)
  }
  return out
}

/** Inclusive list of `YYYY-MM-DD` keys covering a full year. */
export function daysInYear(year: number): string[] {
  const out: string[] = []
  for (let m = 0; m < 12; m++) {
    const count = new Date(year, m + 1, 0).getDate()
    for (let day = 1; day <= count; day++) {
      out.push(`${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
    }
  }
  return out
}

/** Shift a `YYYY-MM` key by `delta` months. */
export function addMonths(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return monthKey(d)
}
