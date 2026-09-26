import { useState } from 'react'
import { useLocation, NavLink, Outlet } from 'react-router-dom'
import {
  BookOpen,
  Coins,
  Gamepad2,
  Home as HomeIcon,
  LogOut,
  Map,
  Settings as SettingsIcon,
  Shirt,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import { useAuth } from '../context/AuthContext'
import { AvatarCard } from './AvatarCard'
import { CoinCounter } from './CoinCounter'
import { StreakBadge } from './StreakBadge'
import { XPBar } from './XPBar'
import { Toaster } from './Toaster'
import { Celebration } from './Celebration'
import { rewardById } from '../data/rewards'

const NAV = [
  { to: '/', label: 'Lobby', icon: HomeIcon, end: true },
  { to: '/spelling', label: 'Spelling', icon: BookOpen },
  { to: '/math', label: 'Math', icon: Swords },
  { to: '/verse', label: 'Verse', icon: Sparkles },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/wardrobe', label: 'Wardrobe', icon: Shirt },
  { to: '/rewards', label: 'Shop', icon: Coins },
  { to: '/achievements', label: 'Trophies', icon: Trophy },
  { to: '/learners', label: 'Learners', icon: Users },
]

export function Layout() {
  const { student, settings, updateSettings, resetProgress } = useGame()
  const [showSettings, setShowSettings] = useState(false)
  const location = useLocation()
  const frame = rewardById(student.frameId)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-arena-night/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <NavLink to="/" className="flex items-center gap-2" aria-label="Level Up Learning home">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-electric-cyan to-indigo-600 shadow-glow">
                <Gamepad2 className="text-white" size={22} aria-hidden />
              </span>
              <span className="hidden font-display text-xl text-white sm:block">
                LEVEL UP <span className="text-electric-cyan">LEARNING</span>
              </span>
            </NavLink>

            <div className="hidden flex-1 max-w-xs md:block">
              <XPBar compact />
            </div>

            <div className="flex items-center gap-2">
              <CoinCounter />
              <StreakBadge className="hidden sm:inline-flex" />
              <button
                className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={() => setShowSettings(true)}
                aria-label="Open settings"
              >
                <SettingsIcon size={20} aria-hidden />
              </button>
              <NavLink
                to="/parent"
                className="grid h-11 w-11 place-items-center rounded-2xl border border-purple-400/30 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25"
                aria-label="Parent mode"
                title="Parent Mode"
              >
                <Shield size={20} aria-hidden />
              </NavLink>
            </div>
          </div>

          <div className="md:hidden">
            <XPBar compact />
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Main navigation">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-[44px] shrink-0 items-center gap-2 rounded-2xl border px-4 text-sm font-bold transition-colors ${
                    isActive
                      ? 'border-electric-cyan/60 bg-electric-cyan/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                  }`
                }
              >
                <Icon size={18} aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5 sm:py-7"
      >
        <Outlet />
      </motion.main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 pt-2 text-center text-xs text-white/40">
        Level Up Learning · original artwork, no third-party game assets
        {frame && ` · Frame: ${frame.name}`}
      </footer>

      <Toaster />
      <Celebration />

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} settings={settings} updateSettings={updateSettings} resetProgress={resetProgress} />
      )}
    </div>
  )
}

interface SettingsPanelProps {
  onClose: () => void
  settings: ReturnType<typeof useGame>['settings']
  updateSettings: ReturnType<typeof useGame>['updateSettings']
  resetProgress: () => void
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      aria-label={label}
    >
      <span>
        <span className="block font-bold text-white">{label}</span>
        <span className="block text-xs text-white/60">{description}</span>
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          value ? 'bg-lime-400' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
            value ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  )
}

function SettingsPanel({ onClose, settings, updateSettings, resetProgress }: SettingsPanelProps) {
  const { student } = useGame()
  const { configured, signOut } = useAuth()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="game-panel w-full max-w-md p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-white">Settings</h2>
          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/5 text-white"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <div className="mb-4 flex justify-center">
          <AvatarCard student={student} size="sm" />
        </div>

        <div className="space-y-3">
          <Toggle
            label="Sound effects"
            description="Beeps and cheers for answers and rewards"
            value={settings.sound}
            onChange={(v) => updateSettings({ sound: v })}
          />
          <Toggle
            label="Music"
            description="Background music (coming soon)"
            value={settings.music}
            onChange={(v) => updateSettings({ music: v })}
          />
          <Toggle
            label="Animations"
            description="Flying XP, confetti, and motion effects"
            value={settings.animations}
            onChange={(v) => updateSettings({ animations: v })}
          />
          <Toggle
            label="Reduced motion"
            description="Calmer screen for sensitive eyes"
            value={settings.reducedMotion}
            onChange={(v) => updateSettings({ reducedMotion: v })}
          />
        </div>

        {configured && (
          <button
            className="btn-ghost mt-5 w-full text-base"
            onClick={() => void signOut()}
          >
            <LogOut size={18} aria-hidden /> Sign out
          </button>
        )}

        <div className="mt-5 border-t border-white/10 pt-4">
          {!confirmReset ? (
            <button className="btn-ghost w-full" onClick={() => setConfirmReset(true)}>
              Reset progress
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-sm text-orange-200">
                This clears XP, coins, streak, and activity history. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  className="btn-ghost flex-1"
                  onClick={() => {
                    resetProgress()
                    setConfirmReset(false)
                    onClose()
                  }}
                >
                  Yes, reset
                </button>
                <button className="btn-primary flex-1" onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
