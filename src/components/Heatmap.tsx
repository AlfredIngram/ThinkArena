import type { HeatCell } from '../services/timeframeEngine'
import { dateKey, parseKey, weekKey, MONTH_SHORT } from '../utils/date'

interface HeatmapProps {
  cells: HeatCell[]
  /** The year being shown (for the date cursor). */
  year: string
  label?: string
}

const LEVEL_BG = [
  'rgba(255,255,255,0.06)',
  'rgba(163,230,53,0.28)',
  'rgba(163,230,53,0.5)',
  'rgba(163,230,53,0.74)',
  'rgba(163,230,53,1)',
]

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/** GitHub-style contribution grid: columns are weeks, rows are days. */
export function Heatmap({ cells, year, label = 'Activity' }: HeatmapProps) {
  const levels = new Map(cells.map((c) => [c.date, c.level]))

  const columns: (HeatCell | null)[][] = []
  const cursor = parseKey(weekKey(parseKey(`${year}-01-01`)))
  const end = parseKey(`${year}-12-31`)

  while (cursor <= end) {
    const week: (HeatCell | null)[] = []
    for (let d = 0; d < 7; d++) {
      const key = dateKey(cursor)
      if (key.startsWith(year)) {
        week.push({ date: key, xp: 0, level: (levels.get(key) ?? 0) as HeatCell['level'] })
      } else {
        week.push(null)
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    columns.push(week)
  }

  // One label per month: show on the first column whose Monday is in that month.
  const monthLabels: (string | null)[] = columns.map((week) => {
    const firstReal = week.find(Boolean)
    if (!firstReal) return null
    const d = parseKey(firstReal.date)
    return d.getDate() <= 7 ? MONTH_SHORT[d.getMonth()] : null
  })

  return (
    <div className="overflow-x-auto" role="img" aria-label={`${label} heatmap for ${year}`}>
      <div className="inline-block min-w-full">
        <div className="flex gap-[3px] pb-1 pl-6">
          {monthLabels.map((m, i) => (
            <span key={i} className="w-[13px] shrink-0 text-[9px] leading-none text-white/40">
              {m ?? ''}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          <div className="mr-1 flex flex-col gap-[3px] pt-0">
            {DOW.map((d, i) => (
              <span key={i} className="h-[13px] text-[9px] leading-[13px] text-white/40">
                {i % 2 === 0 ? d : ''}
              </span>
            ))}
          </div>
          {columns.map((week, ci) => (
            <div key={ci} className="flex flex-col gap-[3px]">
              {week.map((cell, ri) => (
                <span
                  key={ri}
                  title={cell ? `${cell.date}: ${cell.xp} XP` : ''}
                  className="h-[13px] w-[13px] rounded-[3px]"
                  style={{
                    background: cell ? LEVEL_BG[cell.level] : 'transparent',
                    boxShadow: cell && cell.level >= 3 ? '0 0 6px rgba(163,230,53,0.6)' : undefined,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-white/40">
          <span>Less</span>
          {LEVEL_BG.map((bg, i) => (
            <span key={i} className="h-[10px] w-[10px] rounded-[2px]" style={{ background: bg }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
