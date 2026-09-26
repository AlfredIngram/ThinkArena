import type { DailyRecord, TimeframeTotals } from '../types'
import { parseKey, weekKey } from '../utils/date'

/**
 * Timeframe engine.
 *
 * Weekly counters live on `progress.weekly` (fast path, resets each Monday).
 * Everything longer - monthly, yearly, and the GitHub-style heatmap - is
 * *derived* from the append-only `progress.history` timeline so the numbers can
 * never drift out of sync.
 */

/** Keep roughly 13 months of daily rows. */
export const HISTORY_LIMIT = 400

export interface ActivityDelta {
  xp?: number
  coins?: number
  correct?: number
  spellingCorrect?: number
  mathCorrect?: number
  verseStages?: number
}

export function emptyTotals(): TimeframeTotals {
  return {
    xp: 0,
    coins: 0,
    correct: 0,
    spellingCorrect: 0,
    mathCorrect: 0,
    verseStages: 0,
    daysActive: 0,
  }
}

function addRecord(totals: TimeframeTotals, row: DailyRecord): TimeframeTotals {
  totals.xp += row.xp
  totals.coins += row.coins
  totals.correct += row.correct
  totals.spellingCorrect += row.spellingCorrect
  totals.mathCorrect += row.mathCorrect
  totals.verseStages += row.verseStages
  if (row.xp > 0 || row.correct > 0 || row.verseStages > 0) totals.daysActive += 1
  return totals
}

/** Upsert today's row with the deltas from one scored action. */
export function applyDailyRecord(
  history: DailyRecord[],
  date: string,
  delta: ActivityDelta,
): DailyRecord[] {
  const next = history.slice()
  const idx = next.findIndex((r) => r.date === date)
  const base: DailyRecord =
    idx >= 0
      ? next[idx]
      : { date, xp: 0, coins: 0, correct: 0, spellingCorrect: 0, mathCorrect: 0, verseStages: 0 }

  const merged: DailyRecord = {
    date,
    xp: base.xp + (delta.xp ?? 0),
    coins: base.coins + (delta.coins ?? 0),
    correct: base.correct + (delta.correct ?? 0),
    spellingCorrect: base.spellingCorrect + (delta.spellingCorrect ?? 0),
    mathCorrect: base.mathCorrect + (delta.mathCorrect ?? 0),
    verseStages: base.verseStages + (delta.verseStages ?? 0),
  }

  if (idx >= 0) next[idx] = merged
  else next.push(merged)

  // Keep the newest rows; trim from the front.
  next.sort((a, b) => (a.date < b.date ? -1 : 1))
  if (next.length > HISTORY_LIMIT) next.splice(0, next.length - HISTORY_LIMIT)
  return next
}

/** Aggregate totals across any inclusive date-key window. */
export function totalsForRange(
  history: DailyRecord[],
  fromKey: string,
  toKey: string,
): TimeframeTotals {
  const totals = emptyTotals()
  for (const row of history) {
    if (row.date >= fromKey && row.date <= toKey) addRecord(totals, row)
  }
  return totals
}

/** Totals for a `YYYY-MM` month key. */
export function monthTotals(history: DailyRecord[], month: string): TimeframeTotals {
  return totalsForRange(history, `${month}-01`, `${month}-31`)
}

/** Totals for a `YYYY` year. */
export function yearTotals(history: DailyRecord[], year: string): TimeframeTotals {
  return totalsForRange(history, `${year}-01-01`, `${year}-12-31`)
}

/** Totals for the Monday-keyed week. */
export function weekTotals(history: DailyRecord[], monday: string): TimeframeTotals {
  const totals = emptyTotals()
  for (const row of history) {
    if (weekKey(parseKey(row.date)) === monday) addRecord(totals, row)
  }
  return totals
}

export interface HeatCell {
  date: string
  xp: number
  /** 0 (nothing) through 4 (strongest day). */
  level: 0 | 1 | 2 | 3 | 4
}

/** GitHub-style contribution grid for a year: rows are days-of-week columns. */
export function heatmap(history: DailyRecord[], dates: string[]): HeatCell[] {
  const byDate = new Map(history.map((r) => [r.date, r.xp]))
  const max = Math.max(1, ...dates.map((d) => byDate.get(d) ?? 0))
  return dates.map((date) => {
    const xp = byDate.get(date) ?? 0
    let level: HeatCell['level'] = 0
    if (xp > 0) {
      const ratio = xp / max
      level = ratio > 0.75 ? 4 : ratio > 0.5 ? 3 : ratio > 0.25 ? 2 : 1
    }
    return { date, xp, level }
  })
}

export interface WeekBucket {
  weekOf: string
  xp: number
}

/** Best (highest-XP) week within a year, for the yearly summary. */
export function bestWeek(history: DailyRecord[], year: string): WeekBucket {
  const buckets = new Map<string, number>()
  for (const row of history) {
    if (!row.date.startsWith(year)) continue
    const wk = weekKey(parseKey(row.date))
    buckets.set(wk, (buckets.get(wk) ?? 0) + row.xp)
  }
  let best: WeekBucket = { weekOf: '', xp: 0 }
  for (const [weekOf, xp] of buckets) {
    if (xp > best.xp) best = { weekOf, xp }
  }
  return best
}

/** Days with activity in a given prefix (month `YYYY-MM` or year `YYYY`). */
export function activeDays(history: DailyRecord[], prefix: string): number {
  const seen = new Set<string>()
  for (const row of history) {
    if (!row.date.startsWith(prefix)) continue
    if (row.xp > 0 || row.correct > 0 || row.verseStages > 0) seen.add(row.date)
  }
  return seen.size
}

/** Total days logged in a `YYYY-MM` month (for the "X of N days" readout). */
export function daysWithActivity(history: DailyRecord[], prefix: string): string[] {
  return history
    .filter((r) => r.date.startsWith(prefix) && (r.xp > 0 || r.correct > 0 || r.verseStages > 0))
    .map((r) => r.date)
}
