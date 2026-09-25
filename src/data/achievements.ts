import type { AchievementDef } from '../types'

/**
 * Achievement catalogue. Unlock logic lives in `services/achievementEngine.ts`
 * so badges can be added here without touching UI.
 */
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-win',
    title: 'First Win',
    description: 'Complete your first activity.',
    icon: '🎉',
    tier: 'bronze',
  },
  {
    id: 'word-warrior',
    title: 'Word Warrior',
    description: 'Get 10 spelling words correct.',
    icon: '⚔️',
    tier: 'bronze',
  },
  {
    id: 'spelling-master',
    title: 'Spelling Master',
    description: 'Master every word on this week’s list.',
    icon: '📚',
    tier: 'gold',
  },
  {
    id: 'math-hero',
    title: 'Math Hero',
    description: 'Solve 50 math problems.',
    icon: '🦸',
    tier: 'silver',
  },
  {
    id: 'combo-king',
    title: 'Combo King',
    description: 'Get 10 correct answers in a row.',
    icon: '🔥',
    tier: 'silver',
  },
  {
    id: 'verse-explorer',
    title: 'Verse Explorer',
    description: 'Complete a Bible verse stage.',
    icon: '🧭',
    tier: 'bronze',
  },
  {
    id: 'verse-master',
    title: 'Verse Master',
    description: 'Master the weekly verse.',
    icon: '📖',
    tier: 'gold',
  },
  {
    id: 'on-fire',
    title: 'On Fire',
    description: 'Maintain a 5-day streak.',
    icon: '🚀',
    tier: 'silver',
  },
  {
    id: 'perfect-round',
    title: 'Perfect Round',
    description: 'Score 100% in a challenge.',
    icon: '💯',
    tier: 'silver',
  },
  {
    id: 'boss-slayer',
    title: 'Boss Slayer',
    description: 'Defeat a weekly boss.',
    icon: '🐲',
    tier: 'legendary',
  },
  {
    id: 'level-five',
    title: 'Rising Star',
    description: 'Reach level 5.',
    icon: '⭐',
    tier: 'bronze',
  },
  {
    id: 'coin-collector',
    title: 'Coin Collector',
    description: 'Earn 500 coins.',
    icon: '🪙',
    tier: 'silver',
  },
  {
    id: 'high-scorer',
    title: 'High Scorer',
    description: 'Earn 2,000 XP.',
    icon: '🏆',
    tier: 'gold',
  },
]
