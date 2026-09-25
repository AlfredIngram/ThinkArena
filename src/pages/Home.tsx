import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Coins,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from 'lucide-react'
import { useGame } from '../context/GameContext'
import { GameCard } from '../components/GameCard'
import { MissionCard } from '../components/MissionCard'
import { ProgressRing } from '../components/ProgressRing'
import { AvatarCard } from '../components/AvatarCard'
import { XPBar } from '../components/XPBar'
import { StreakBadge } from '../components/StreakBadge'
import { CoinCounter } from '../components/CoinCounter'
import { masteredCount, MASTERY_THRESHOLD } from '../services/adaptiveLearning'
import { missionProgressValue } from '../services/missionEngine'

export function Home() {
  const { student, lesson, progress, dailyMissions } = useGame()

  const totalWords = lesson.spellingWords.length
  const mastered = masteredCount(lesson.spellingWords, progress.spelling)
  const spellingPct = totalWords ? Math.round((mastered / totalWords) * 100) : 0

  const mathTarget = Math.max(25, lesson.goals.mathProblemsGoal * 2)
  const mathPct = Math.min(100, Math.round((progress.weekly.mathCorrect / mathTarget) * 100))

  const verseStats = Object.values(progress.verse).find((v) => v.reference === lesson.bibleVerse.reference)
  const verseStages = verseStats?.stagesCompleted.length ?? 0
  const versePct = Math.round((verseStages / 6) * 100)

  const weeklyPct = Math.min(100, Math.round((progress.weekly.xp / lesson.goals.weeklyXpGoal) * 100))

  return (
    <div className="space-y-6">
      {/* Hero */}
      <GameCard className="tile-grid">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <AvatarCard student={student} size="lg" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="font-display text-sm uppercase tracking-widest text-electric-cyan">
                Welcome back
              </p>
              <h1 className="font-display text-4xl text-white text-outline sm:text-5xl">
                Welcome Back, Champion!
              </h1>
              <p className="mt-1 text-white/70">
                Your next quest is waiting, {student.name}.
              </p>
            </div>

            <XPBar />

            <div className="flex flex-wrap gap-2">
              <CoinCounter />
              <StreakBadge />
              <span className="chip border-cyan-400/30 bg-cyan-500/10 text-cyan-100">
                <Trophy size={16} aria-hidden /> {progress.achievements.length} trophies
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <ProgressRing
              percent={weeklyPct}
              label="Weekly XP"
              sublabel={`${progress.weekly.xp} / ${lesson.goals.weeklyXpGoal} XP`}
              color="#a3e635"
            />
          </div>
        </div>
      </GameCard>

      {/* Mission cards */}
      <section aria-label="Main quests">
        <h2 className="mb-3 font-display text-2xl text-white">MISSION SELECT</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <GameCard className="border-cyan-400/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl text-white">SPELLING QUEST</p>
                <p className="text-sm text-white/60">{lesson.spellingWords.length} words this week</p>
              </div>
              <BookOpen className="text-electric-cyan" size={28} aria-hidden />
            </div>
            <p className="mt-4 font-display text-3xl text-electric-cyan">
              {mastered} / {totalWords} <span className="text-lg text-white/70">words mastered</span>
            </p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/40">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-electric-cyan to-electric-blue"
                initial={false}
                animate={{ width: `${spellingPct}%` }}
              />
            </div>
            <Link to="/spelling" className="btn-primary mt-4 w-full">
              CONTINUE QUEST <ArrowRight size={18} aria-hidden />
            </Link>
          </GameCard>

          <GameCard className="border-orange-400/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl text-white">MATH BATTLE</p>
                <p className="text-sm text-white/60">Level {lesson.math.difficulty} arena</p>
              </div>
              <Swords className="text-electric-orange" size={28} aria-hidden />
            </div>
            <p className="mt-4 font-display text-3xl text-electric-orange">
              {progress.weekly.mathCorrect} / {mathTarget}{' '}
              <span className="text-lg text-white/70">challenges defeated</span>
            </p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/40">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-500"
                initial={false}
                animate={{ width: `${mathPct}%` }}
              />
            </div>
            <Link to="/math" className="btn-gold mt-4 w-full">
              ENTER ARENA <ArrowRight size={18} aria-hidden />
            </Link>
          </GameCard>

          <GameCard className="border-purple-400/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl text-white">VERSE VAULT</p>
                <p className="text-sm text-white/60">{lesson.bibleVerse.reference}</p>
              </div>
              <Sparkles className="text-purple-300" size={28} aria-hidden />
            </div>
            <p className="mt-4 font-display text-3xl text-purple-200">
              {versePct}% <span className="text-lg text-white/70">mastered</span>
            </p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/40">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-600"
                initial={false}
                animate={{ width: `${versePct}%` }}
              />
            </div>
            <Link to="/verse" className="btn-primary mt-4 w-full">
              OPEN VAULT <ArrowRight size={18} aria-hidden />
            </Link>
          </GameCard>
        </div>
      </section>

      {/* Daily missions + side tiles */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-label="Today's missions">
          <h2 className="mb-3 flex items-center gap-2 font-display text-2xl text-white">
            <Target className="text-electric-lime" size={24} aria-hidden /> TODAY’S MISSIONS
          </h2>
          <div className="space-y-3">
            {dailyMissions.map((mission) => {
              const value = missionProgressValue(progress.missions, mission)
              return (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  value={value}
                  complete={value >= mission.target}
                />
              )
            })}
          </div>
          <p className="mt-3 text-xs text-white/50">
            Missions reset every day. Finish all three for a big XP bonus!
          </p>
        </section>

        <section className="space-y-3" aria-label="More areas">
          <h2 className="font-display text-2xl text-white">MORE AREAS</h2>

          <Link to="/map" className="block">
            <GameCard interactive className="flex items-center gap-3">
              <CalendarDays className="text-electric-cyan" size={26} aria-hidden />
              <span className="flex-1">
                <span className="block font-display text-lg text-white">Weekly Map</span>
                <span className="block text-xs text-white/60">
                  {progress.weeklyCheckpoints.length} checkpoints reached
                </span>
              </span>
              <ArrowRight size={18} aria-hidden />
            </GameCard>
          </Link>

          <Link to="/rewards" className="block">
            <GameCard interactive className="flex items-center gap-3">
              <Coins className="text-electric-gold" size={26} aria-hidden />
              <span className="flex-1">
                <span className="block font-display text-lg text-white">Item Shop</span>
                <span className="block text-xs text-white/60">{progress.coins} coins to spend</span>
              </span>
              <ArrowRight size={18} aria-hidden />
            </GameCard>
          </Link>

          <Link to="/achievements" className="block">
            <GameCard interactive className="flex items-center gap-3">
              <Trophy className="text-electric-pink" size={26} aria-hidden />
              <span className="flex-1">
                <span className="block font-display text-lg text-white">Trophy Room</span>
                <span className="block text-xs text-white/60">
                  {progress.achievements.length} unlocked
                </span>
              </span>
              <ArrowRight size={18} aria-hidden />
            </GameCard>
          </Link>

          <div className="chip w-full justify-center border-white/10 text-white/60">
            Confetti tip: reach {MASTERY_THRESHOLD}% to master a spelling word
          </div>
        </section>
      </div>
    </div>
  )
}
