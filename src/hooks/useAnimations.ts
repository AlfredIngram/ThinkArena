import { useGame } from '../context/GameContext'

/** Central switch so every animated component respects the settings toggles. */
export function useAnimations(): boolean {
  const { settings } = useGame()
  return settings.animations && !settings.reducedMotion
}
