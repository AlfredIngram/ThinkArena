import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import { Layout } from './components/Layout'
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

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GameProvider>
  )
}
