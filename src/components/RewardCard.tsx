import { Check, Lock } from 'lucide-react'
import type { RewardDef } from '../types'

interface RewardCardProps {
  reward: RewardDef
  owned: boolean
  equipped: boolean
  affordable: boolean
  onBuy: () => void
  onEquip: () => void
}

/** Item-shop card. Buy with coins, then equip. */
export function RewardCard({ reward, owned, equipped, affordable, onBuy, onEquip }: RewardCardProps) {
  return (
    <div
      className={`game-panel flex flex-col overflow-hidden transition-transform hover:-translate-y-1 ${
        equipped ? 'ring-2 ring-electric-cyan' : ''
      }`}
    >
      <div className={`flex h-24 items-center justify-center bg-gradient-to-br ${reward.gradient}`}>
        <span className="text-5xl drop-shadow-lg" aria-hidden>
          {reward.art}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="font-display text-base leading-tight text-white">{reward.name}</p>
        <p className="mt-1 flex-1 text-[11px] leading-tight text-white/60">{reward.description}</p>

        <div className="mt-3">
          {owned ? (
            equipped ? (
              <span className="chip w-full justify-center border-cyan-400/40 bg-cyan-500/15 text-cyan-200">
                <Check size={14} aria-hidden /> Equipped
              </span>
            ) : (
              <button className="btn-success w-full text-base" onClick={onEquip}>
                Equip
              </button>
            )
          ) : (
            <button
              className={`w-full text-base ${affordable ? 'btn-gold' : 'btn-ghost'}`}
              onClick={onBuy}
              disabled={!affordable}
              aria-label={`Buy ${reward.name} for ${reward.cost} coins`}
            >
              {!affordable && <Lock size={16} aria-hidden />}
              🪙 {reward.cost}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
