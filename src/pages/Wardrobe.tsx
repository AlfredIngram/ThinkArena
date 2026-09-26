import { useState } from 'react'
import { Check, Lock, Shirt, Sparkles, Wand2 } from 'lucide-react'
import type { WardrobeItem, WardrobeSlot } from '../types'
import { useGame } from '../context/GameContext'
import { GameCard } from '../components/GameCard'
import { CoinCounter } from '../components/CoinCounter'
import { Avatar } from '../components/Avatar'
import {
  RARITY,
  SLOT_LABELS,
  SLOT_ORDER,
  WARDROBE,
  itemsForSlot,
  wardrobeById,
} from '../data/wardrobe'

type Tab = WardrobeSlot | 'all'

/** Wardrobe = layered cosmetic shop. Buy with coins, equip per slot. */
export function Wardrobe() {
  const { progress, student, buyWardrobeItem, equipWardrobeItem, buzz } = useGame()
  const [tab, setTab] = useState<Tab>('all')
  const [preview, setPreview] = useState<WardrobeItem | null>(null)

  const items = tab === 'all' ? WARDROBE : itemsForSlot(tab)
  const equip = student.wardrobe

  function equippedIdFor(item: WardrobeItem): boolean {
    return equip[item.slot] === item.id
  }

  function handleBuy(item: WardrobeItem) {
    const result = buyWardrobeItem(item)
    if (!result.ok) buzz('incorrect')
  }

  const previewEquip = preview ? { ...equip, [preview.slot]: preview.id } : equip

  return (
    <div className="space-y-5">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="flex items-center justify-center gap-2 font-display text-4xl text-white text-outline">
          <Shirt size={30} aria-hidden /> WARDROBE
        </h1>
        <p className="text-white/70">Mix and match layers to build your own character</p>
        <CoinCounter />
      </header>

      <GameCard className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-2">
          <Avatar equip={previewEquip} size={168} label="Your character preview" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-display text-xl text-white">{student.name}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            {SLOT_ORDER.map((slot) => (
              <span key={slot} className="chip text-xs">
                {SLOT_LABELS[slot]}: {wardrobeById(equip[slot])?.name ?? '—'}
              </span>
            ))}
          </div>
          {preview && (
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-electric-cyan sm:justify-start">
              <Wand2 size={13} aria-hidden /> Previewing {preview.name}
            </p>
          )}
        </div>
      </GameCard>

      <div className="flex flex-wrap justify-center gap-2">
        <SlotButton active={tab === 'all'} onClick={() => setTab('all')} label="All Items" />
        {SLOT_ORDER.map((slot) => (
          <SlotButton
            key={slot}
            active={tab === slot}
            onClick={() => setTab(slot)}
            label={SLOT_LABELS[slot]}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const owned = progress.rewards.includes(item.id)
          const equipped = equippedIdFor(item)
          const affordable = progress.coins >= item.cost
          const rarity = RARITY[item.rarity]
          return (
            <div
              key={item.id}
              className={`game-panel flex flex-col overflow-hidden border ${rarity.border} ${
                equipped ? 'ring-2 ring-electric-cyan' : ''
              }`}
              onMouseEnter={() => setPreview(item)}
              onMouseLeave={() => setPreview(null)}
            >
              <div className={`flex h-28 items-center justify-center bg-gradient-to-br ${rarity.bg}`}>
                <Avatar equip={{ ...equip, [item.slot]: item.id }} size={96} simple label={item.name} />
              </div>
              <div className="flex flex-1 flex-col p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-base leading-tight text-white">{item.name}</p>
                  <span className={`text-[10px] font-bold uppercase ${rarity.text}`}>{rarity.label}</span>
                </div>
                <p className="mt-1 flex-1 text-[11px] leading-tight text-white/60">{item.description}</p>

                <div className="mt-3">
                  {owned ? (
                    equipped ? (
                      <span className="chip w-full justify-center border-cyan-400/40 bg-cyan-500/15 text-cyan-200">
                        <Check size={14} aria-hidden /> Equipped
                      </span>
                    ) : (
                      <button className="btn-success w-full text-base" onClick={() => equipWardrobeItem(item)}>
                        Equip
                      </button>
                    )
                  ) : (
                    <button
                      className={`w-full text-base ${affordable ? 'btn-gold' : 'btn-ghost'} ${rarity.glow}`}
                      onClick={() => handleBuy(item)}
                      disabled={!affordable}
                      aria-label={`Buy ${item.name} for ${item.cost} coins`}
                    >
                      {!affordable && <Lock size={16} aria-hidden />}
                      🪙 {item.cost}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <GameCard className="flex items-center gap-3 text-sm text-white/70">
        <Sparkles className="shrink-0 text-electric-pink" size={24} aria-hidden />
        <p>
          Every piece is original art drawn in code - no third-party assets. Buy once, then mix layers
          freely. Rarer items glow with their tier color.
        </p>
      </GameCard>
    </div>
  )
}

function SlotButton({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      className={`min-h-[44px] rounded-2xl border px-4 text-sm font-bold transition-colors ${
        active
          ? 'border-electric-cyan/60 bg-electric-cyan/15 text-white'
          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
      }`}
      onClick={onClick}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

export default Wardrobe
