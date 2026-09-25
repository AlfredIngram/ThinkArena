import type { RewardDef } from '../types'

/**
 * Cosmetic reward catalogue for the shop. Everything here is original
 * placeholder art (emoji + gradients) so no third-party assets are involved.
 */
export const REWARDS: RewardDef[] = [
  // Avatars --------------------------------------------------------------
  {
    id: 'avatar-astro',
    name: 'Astro Cadet',
    category: 'avatar',
    cost: 0,
    art: '🚀',
    gradient: 'from-sky-500 to-indigo-600',
    description: 'Your starting pilot.',
  },
  {
    id: 'avatar-nova',
    name: 'Nova Ninja',
    category: 'avatar',
    cost: 150,
    art: '🥷',
    gradient: 'from-fuchsia-500 to-purple-700',
    description: 'Silent, speedy, stylish.',
  },
  {
    id: 'avatar-cyber',
    name: 'Cyber Sprout',
    category: 'avatar',
    cost: 200,
    art: '🤖',
    gradient: 'from-cyan-400 to-blue-600',
    description: 'A friendly garden robot.',
  },
  {
    id: 'avatar-blaze',
    name: 'Blaze Ranger',
    category: 'avatar',
    cost: 300,
    art: '🦊',
    gradient: 'from-orange-400 to-rose-600',
    description: 'Fastest tail in the arena.',
  },
  // Backgrounds ----------------------------------------------------------
  {
    id: 'bg-nebula',
    name: 'Nebula Drift',
    category: 'background',
    cost: 0,
    art: '🌌',
    gradient: 'from-indigo-700 via-purple-700 to-slate-900',
    description: 'The classic arena sky.',
  },
  {
    id: 'bg-galaxy',
    name: 'Galaxy Background',
    category: 'background',
    cost: 500,
    art: '✨',
    gradient: 'from-violet-600 via-blue-700 to-cyan-600',
    description: 'A swirling sea of stars.',
  },
  {
    id: 'bg-forest',
    name: 'Nano Forest',
    category: 'background',
    cost: 400,
    art: '🌲',
    gradient: 'from-emerald-600 via-teal-700 to-slate-900',
    description: 'Glowing trees and fireflies.',
  },
  {
    id: 'bg-lava',
    name: 'Lava Keep',
    category: 'background',
    cost: 600,
    art: '🌋',
    gradient: 'from-amber-600 via-red-700 to-slate-900',
    description: 'For the boldest challengers.',
  },
  // Frames ---------------------------------------------------------------
  {
    id: 'frame-basic',
    name: 'Rookie Frame',
    category: 'frame',
    cost: 0,
    art: '⬜',
    gradient: 'from-slate-400 to-slate-600',
    description: 'Simple and clean.',
  },
  {
    id: 'frame-gold',
    name: 'Gold Profile Frame',
    category: 'frame',
    cost: 750,
    art: '🟨',
    gradient: 'from-amber-300 to-yellow-600',
    description: 'Shine like a champion.',
  },
  {
    id: 'frame-neon',
    name: 'Neon Frame',
    category: 'frame',
    cost: 500,
    art: '🟩',
    gradient: 'from-lime-300 to-emerald-500',
    description: 'Glow with every win.',
  },
  // Badges ---------------------------------------------------------------
  {
    id: 'badge-dragon',
    name: 'Dragon Badge',
    category: 'badge',
    cost: 1000,
    art: '🐉',
    gradient: 'from-rose-400 to-red-700',
    description: 'Legendary boss hunter.',
  },
  {
    id: 'badge-bolt',
    name: 'Bolt Badge',
    category: 'badge',
    cost: 350,
    art: '⚡',
    gradient: 'from-yellow-300 to-amber-600',
    description: 'Quick thinker.',
  },
  // Pets -----------------------------------------------------------------
  {
    id: 'pet-robot',
    name: 'Robot Buddy',
    category: 'pet',
    cost: 250,
    art: '🤖',
    gradient: 'from-cyan-400 to-sky-700',
    description: 'Beeps when you get it right.',
  },
  {
    id: 'pet-blob',
    name: 'Blob Pal',
    category: 'pet',
    cost: 200,
    art: '🫧',
    gradient: 'from-teal-300 to-blue-600',
    description: 'Wobbles happily beside you.',
  },
  {
    id: 'pet-owl',
    name: 'Night Owl',
    category: 'pet',
    cost: 450,
    art: '🦉',
    gradient: 'from-purple-400 to-indigo-700',
    description: 'The wisest companion.',
  },
]

export const REWARD_CATEGORY_LABELS: Record<RewardDef['category'], string> = {
  avatar: 'Avatars',
  background: 'Backgrounds',
  frame: 'Frames',
  badge: 'Badges',
  pet: 'Pets',
}

export function rewardById(id: string): RewardDef | undefined {
  return REWARDS.find((r) => r.id === id)
}
