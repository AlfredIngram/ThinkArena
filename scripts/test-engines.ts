/**
 * Throwaway engine smoke test (bundled with esbuild, run with node).
 * Covers the new multi-timeframe + wardrobe logic.
 */
import { createProgress, createLesson, createStudent } from '../src/data/defaults'
import { DEFAULT_OWNED_WARDROBE, DEFAULT_WARDROBE, wardrobeById } from '../src/data/wardrobe'
import { recordSpellingAttempt, recordMathAttempt, purchaseReward } from '../src/services/gameEngine'
import { applyDailyRecord, monthTotals, yearTotals, monthTotals as mt } from '../src/services/timeframeEngine'
import { todayKey, monthKey, yearKey } from '../src/utils/date'

let failures = 0
function check(name: string, cond: boolean) {
  if (cond) {
    console.log(`  ok   ${name}`)
  } else {
    failures++
    console.log(`  FAIL ${name}`)
  }
}

const empty = createProgress()
check('fresh progress has empty history', Array.isArray(empty.history) && empty.history.length === 0)

const lesson = createLesson()
check('lesson has longGoals', !!lesson.longGoals && lesson.longGoals.monthlyXpGoal > 0)

// Spelling attempt writes into today's history row.
const r1 = recordSpellingAttempt(empty, lesson, 'friend', true)
const today = r1.next.history.find((h) => h.date === todayKey())
check('history records spelling correct', !!today && today.spellingCorrect === 1)
check('history records xp', !!today && today.xp > 0)
check('weekly xp advanced', r1.next.weekly.xp > 0)

// Math attempt adds to the same row.
const r2 = recordMathAttempt(r1.next, lesson, 'addition', true)
const today2 = r2.next.history.find((h) => h.date === todayKey())
check('history accumulates math correct', !!today2 && today2.mathCorrect === 1 && today2.spellingCorrect === 1)
check('history still one row for today', r2.next.history.filter((h) => h.date === todayKey()).length === 1)

// Aggregation.
const m = monthTotals(r2.next.history, monthKey())
check('month totals include both attempts', m.correct === 2 && m.xp > 0)
const y = yearTotals(r2.next.history, yearKey())
check('year totals match month totals', y.correct === 2 && y.xp === m.xp)

// applyDailyRecord upsert + ordering.
const seeded = applyDailyRecord(
  [
    { date: '2030-01-02', xp: 5, coins: 0, correct: 1, spellingCorrect: 1, mathCorrect: 0, verseStages: 0 },
    { date: '2030-01-01', xp: 5, coins: 0, correct: 1, spellingCorrect: 1, mathCorrect: 0, verseStages: 0 },
  ],
  '2030-01-01',
  { xp: 10, correct: 2 },
)
check('applyDailyRecord upserts existing date', seeded.find((r) => r.date === '2030-01-01')?.xp === 15)
check('applyDailyRecord keeps sorted', seeded[0].date === '2030-01-01' && seeded[1].date === '2030-01-02')

// Wardrobe ownership + purchase.
check('free wardrobe items owned by default', DEFAULT_OWNED_WARDROBE.length >= 7)
check(
  'every default equip item is owned',
  Object.values(DEFAULT_WARDROBE).every((id) => DEFAULT_OWNED_WARDROBE.includes(id)),
)
const student = createStudent()
check('student wardrobe hydrated', !!student.wardrobe && !!student.wardrobe.base)
const paid = wardrobeById('hair-crown')!
const rich = { ...createProgress(), coins: 100000 }
const bought = purchaseReward(rich, paid)
check('can buy a wardrobe item', bought.ok && bought.next.rewards.includes(paid.id) && bought.next.coins === 100000 - paid.cost)
const poor = purchaseReward(createProgress(), paid)
check('cannot buy without coins', !poor.ok && poor.reason === 'poor')

// Aliased import sanity (mt === monthTotals).
check('alias import wired', typeof mt === 'function')

console.log(failures === 0 ? '\nAll engine checks passed.' : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
