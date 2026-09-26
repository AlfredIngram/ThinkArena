import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { StudentProvider, useStudents } from './context/StudentContext'
import { GameProvider } from './context/GameContext'
import { Layout } from './components/Layout'
import { Splash } from './components/Splash'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { SpellingQuest } from './pages/SpellingQuest'
import { MathBattle } from './pages/MathBattle'
import { VerseVault } from './pages/VerseVault'
import { WeeklyMap } from './pages/WeeklyMap'
import { Goals } from './pages/Goals'
import { Wardrobe } from './pages/Wardrobe'
import { Rewards } from './pages/Rewards'
import { Achievements } from './pages/Achievements'
import { ParentDashboard } from './pages/ParentDashboard'
import { NotFound } from './pages/NotFound'
import { setStorageNamespace } from './services/storage'
import type { StudentRow } from './services/remote'

/** The routed game UI, shared by local mode and signed-in mode. */
function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/spelling" element={<SpellingQuest />} />
        <Route path="/math" element={<MathBattle />} />
        <Route path="/verse" element={<VerseVault />} />
        <Route path="/map" element={<WeeklyMap />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/learners" element={<Onboarding />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

/**
 * Mounts the game for one student. The storage namespace is set synchronously
 * before <GameProvider> reads anything, and the `key` forces a clean remount
 * (fresh state) whenever the active student changes.
 */
function GameShell({ student }: { student: StudentRow | null }) {
  // Idempotent: safe across StrictMode double-renders.
  setStorageNamespace(student?.id ?? null)
  return (
    <GameProvider
      key={student?.id ?? 'local'}
      remote={
        student
          ? { studentId: student.id, name: student.name, avatar: student.avatar }
          : undefined
      }
    >
      <AppRoutes />
    </GameProvider>
  )
}

/** Decides between splash / login / onboarding / game. */
function Root() {
  const { configured, loading, session } = useAuth()

  // No Supabase env vars → original local-only behaviour, unchanged.
  if (!configured) return <GameShell student={null} />

  if (loading) return <Splash label="Checking sign-in…" />
  if (!session) return <Login />

  return (
    <StudentProvider>
      <SignedIn />
    </StudentProvider>
  )
}

function SignedIn() {
  const { loading, provisioning, activeStudent } = useStudents()
  if (loading || provisioning) return <Splash label="Setting things up…" />
  // Fallback only — a primary learner is normally provisioned automatically.
  if (!activeStudent) return <Onboarding />
  return <GameShell student={activeStudent} />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </BrowserRouter>
  )
}
