import { useState } from 'react'
import { Coins, SprayCan, Store } from 'lucide-react'
import type { RewardCategory } from '../types'
import { useGame } from '../context/GameContext'
import { GameCard } from '../components/GameCard'
import { RewardCard } from '../components/RewardCard'
import { CoinCounter } from '../components/CoinCounter'
import { REWARDS, REWARD_CATEGORY_LABELS, rewardById } from '../data/rewards'

const CATEGORIES: (RewardCategory | 'all')[] = ['all', 'avatar', 'background', 'frame', 'badge', 'pet']

/** Rewards = item shop where coins buy cosmetics. */
export function Rewards() {
  const { progress, student, purchaseReward, equipReward, buzz } = useGame()
  const [tab, setTab] = useState<RewardCategory | 'all'>('all')

  const items = tab === 'all' ? REWARDS : REWARDS.filter((r) => r.category === tab)

  function isEquipped(id: string) {
    const reward = rewardById(id)
    if (!reward) return false
    if (reward.category === 'avatar') return student.avatarId === id
    if (reward.category === 'background') return student.backgroundId === id
    if (reward.category === 'frame') return student.frameId === id
    if (reward.category === 'badge') return student.badgeId === id
    return false
  }

  function handleBuy(id: string) {
    const reward = rewardById(id)
    if (!reward) return
    const result = purchaseReward(reward)
    if (!result.ok) buzz('incorrect')
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="flex items-center justify-center gap-2 font-display text-4xl text-white text-outline">
          <Store size={30} aria-hidden /> ITEM SHOP
        </h1>
        <p className="text-white/70">Spend coins on avatars, backgrounds, frames, badges, and pets</p>
        <CoinCounter />
      </header>

      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`min-h-[44px] rounded-2xl border px-4 text-sm font-bold transition-colors ${
              tab === cat
                ? 'border-electric-gold/60 bg-amber-500/20 text-white'
                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
            onClick={() => setTab(cat)}
            aria-pressed={tab === cat}
          >
            {cat === 'all' ? 'All Items' : REWARD_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            owned={progress.rewards.includes(reward.id)}
            equipped={isEquipped(reward.id)}
            affordable={progress.coins >= reward.cost}
            onBuy={() => handleBuy(reward.id)}
            onEquip={() => equipReward(reward.id)}
          />
        ))}
      </div>

      <GameCard className="flex items-center gap-3 text-sm text-white/70">
        <SprayCan className="shrink-0 text-electric-pink" size={24} aria-hidden />
        <p>
          Buy an item once and it is yours forever. Tap <span className="font-bold text-white">Equip</span> to
          wear it on your profile.
        </p>
      </GameCard>

      <p className="flex items-center justify-center gap-2 text-xs text-white/40">
        <Coins size={14} aria-hidden /> Earn coins by answering correctly and finishing missions.
      </p>
    </div>
  )
}
