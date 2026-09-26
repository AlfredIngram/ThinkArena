import type { Rarity, WardrobeEquip, WardrobeItem, WardrobeSlot } from '../types'

/**
 * Layered avatar wardrobe.
 *
 * Every item is original, code-drawn art (see `components/Avatar.tsx`) so the
 * app ships with zero third-party assets. Each item carries `art` hints that
 * the renderer composes, layer by layer, like a Fortnite-style skin - only
 * cute and round instead of edgy.
 *
 * Want raster art instead? Drop a PNG in `public/avatars/` and set
 * `image: '/avatars/<file>.png'` on the item. The renderer prefers the image.
 */

export const SLOT_ORDER: WardrobeSlot[] = [
  'base',
  'skin',
  'hair',
  'outfit',
  'accessory',
  'pet',
  'aura',
]

export const SLOT_LABELS: Record<WardrobeSlot, string> = {
  base: 'Body',
  skin: 'Color',
  hair: 'Hair & Hats',
  outfit: 'Outfits',
  accessory: 'Accessories',
  pet: 'Companions',
  aura: 'Auras',
}

/** Default (free, owned from the start) loadout. */
export const DEFAULT_WARDROBE: WardrobeEquip = {
  base: 'base-round',
  skin: 'skin-peach',
  hair: 'hair-tuft',
  outfit: 'outfit-tee',
  accessory: 'accessory-none',
  pet: 'pet-none',
  aura: 'aura-none',
}

export const RARITY: Record<
  Rarity,
  { label: string; text: string; border: string; bg: string; glow: string }
> = {
  common: {
    label: 'Common',
    text: 'text-slate-200',
    border: 'border-slate-400/40',
    bg: 'from-slate-500/20 to-slate-700/20',
    glow: '',
  },
  rare: {
    label: 'Rare',
    text: 'text-sky-200',
    border: 'border-sky-400/50',
    bg: 'from-sky-500/20 to-blue-700/20',
    glow: 'shadow-[0_0_18px_rgba(56,189,248,0.35)]',
  },
  epic: {
    label: 'Epic',
    text: 'text-fuchsia-200',
    border: 'border-fuchsia-400/50',
    bg: 'from-fuchsia-500/20 to-purple-700/20',
    glow: 'shadow-[0_0_20px_rgba(232,121,249,0.4)]',
  },
  legendary: {
    label: 'Legendary',
    text: 'text-amber-200',
    border: 'border-amber-300/60',
    bg: 'from-amber-400/25 to-orange-600/25',
    glow: 'shadow-glowGold',
  },
}

export const WARDROBE: WardrobeItem[] = [
  // Body ----------------------------------------------------------------
  { id: 'base-round', slot: 'base', name: 'Round Buddy', rarity: 'common', cost: 0, description: 'Soft and huggable.', art: { head: 46, bodyW: 84, bodyH: 74, ears: 'none' } },
  { id: 'base-tall', slot: 'base', name: 'Tall Tot', rarity: 'common', cost: 0, description: 'A little bit lanky.', art: { head: 44, bodyW: 74, bodyH: 92, ears: 'none' } },
  { id: 'base-wide', slot: 'base', name: 'Wide Wobble', rarity: 'common', cost: 80, description: 'Extra squishy.', art: { head: 46, bodyW: 100, bodyH: 70, ears: 'none' } },
  { id: 'base-cat', slot: 'base', name: 'Kitty Head', rarity: 'rare', cost: 250, description: 'Pointy little ears.', art: { head: 46, bodyW: 84, bodyH: 74, ears: 'cat' } },
  { id: 'base-bunny', slot: 'base', name: 'Bunny Head', rarity: 'rare', cost: 250, description: 'Long floppy ears.', art: { head: 46, bodyW: 84, bodyH: 74, ears: 'bunny' } },
  { id: 'base-dragon', slot: 'base', name: 'Dragonling', rarity: 'epic', cost: 650, description: 'Tiny horns, big heart.', art: { head: 46, bodyW: 88, bodyH: 78, ears: 'horn' } },

  // Characters (raster art) ---------------------------------------------
  // One full-body transparent PNG each (in `public/avatars/`). When a
  // character is equipped the renderer draws the whole avatar from the
  // image, so skin/hair/outfit/etc. layers do not apply. Owned from the
  // start - kids pick a character, not buy one.
  { id: 'char-rex', slot: 'base', name: 'Rex', rarity: 'rare', cost: 0, description: 'A bold little daredevil.', image: '/avatars/rex.png', art: {} },
  { id: 'char-ink', slot: 'base', name: 'Ink', rarity: 'rare', cost: 0, description: 'Cool, calm and clever.', image: '/avatars/ink.png', art: {} },
  { id: 'char-byte', slot: 'base', name: 'Byte', rarity: 'epic', cost: 0, description: 'Half robot, all heart.', image: '/avatars/byte.png', art: {} },
  { id: 'char-pixel', slot: 'base', name: 'Pixel', rarity: 'epic', cost: 0, description: 'Playful and bright.', image: '/avatars/pixel.png', art: {} },
  { id: 'char-mochi', slot: 'base', name: 'Mochi', rarity: 'rare', cost: 0, description: 'Soft, squishy, sweet.', image: '/avatars/mochi.png', art: {} },
  { id: 'char-pebble', slot: 'base', name: 'Pebble', rarity: 'common', cost: 0, description: 'Small but sturdy.', image: '/avatars/pebble.png', art: {} },
  { id: 'char-crash', slot: 'base', name: 'Crash', rarity: 'epic', cost: 0, description: 'Loud, fun and fearless.', image: '/avatars/crash.png', art: {} },
  { id: 'char-dash', slot: 'base', name: 'Dash', rarity: 'legendary', cost: 0, description: 'Fastest friend around.', image: '/avatars/dash.png', art: {} },
  { id: 'char-bloop', slot: 'base', name: 'Bloop', rarity: 'common', cost: 0, description: 'A cheerful little blob.', image: '/avatars/bloop.png', art: {} },
  { id: 'char-zap', slot: 'base', name: 'Zap', rarity: 'legendary', cost: 0, description: 'Buzzing with energy.', image: '/avatars/zap.png', art: {} },

  // Skin ----------------------------------------------------------------
  { id: 'skin-peach', slot: 'skin', name: 'Peach', rarity: 'common', cost: 0, description: 'Warm and friendly.', art: { body: '#ffd7b5', blush: '#ff9db1' } },
  { id: 'skin-mint', slot: 'skin', name: 'Mint', rarity: 'common', cost: 0, description: 'Fresh and cool.', art: { body: '#bff3d8', blush: '#ff9db1' } },
  { id: 'skin-lavender', slot: 'skin', name: 'Lavender', rarity: 'common', cost: 90, description: 'Dreamy and soft.', art: { body: '#d9c6ff', blush: '#ff8fbf' } },
  { id: 'skin-sunshine', slot: 'skin', name: 'Sunshine', rarity: 'common', cost: 90, description: 'Bright side up.', art: { body: '#ffe08a', blush: '#ff9d7a' } },
  { id: 'skin-ocean', slot: 'skin', name: 'Ocean', rarity: 'rare', cost: 150, description: 'Calm like the sea.', art: { body: '#a8d8ff', blush: '#ff9db1' } },
  { id: 'skin-rose', slot: 'skin', name: 'Rose', rarity: 'rare', cost: 150, description: 'Sweet as candy.', art: { body: '#ffc2d6', blush: '#ff6f9c' } },
  { id: 'skin-galaxy', slot: 'skin', name: 'Galaxy', rarity: 'epic', cost: 500, description: 'Made of stardust.', art: { body: '#b9a6ff', blush: '#ff7ae0' } },
  { id: 'skin-gold', slot: 'skin', name: 'Pure Gold', rarity: 'legendary', cost: 1200, description: 'Champion material.', art: { body: '#ffd76a', blush: '#ff9d6a' } },

  // Hair & hats ---------------------------------------------------------
  { id: 'hair-tuft', slot: 'hair', name: 'Little Tuft', rarity: 'common', cost: 0, description: 'The classic cowlick.', art: { style: 'tuft', color: '#8a5a3b' } },
  { id: 'hair-bob', slot: 'hair', name: 'Bob Cut', rarity: 'common', cost: 120, description: 'Neat and bouncy.', art: { style: 'bob', color: '#2f2440' } },
  { id: 'hair-ponytail', slot: 'hair', name: 'Ponytail', rarity: 'common', cost: 150, description: 'Ready to run.', art: { style: 'ponytail', color: '#c8631f' } },
  { id: 'hair-curls', slot: 'hair', name: 'Curls', rarity: 'rare', cost: 180, description: 'Springy ringlets.', art: { style: 'curls', color: '#4a2f22' } },
  { id: 'hair-spiky', slot: 'hair', name: 'Spiky', rarity: 'rare', cost: 220, description: 'Full of energy.', art: { style: 'spiky', color: '#1f7a8c' } },
  { id: 'hair-beanie', slot: 'hair', name: 'Cozy Beanie', rarity: 'rare', cost: 200, description: 'Warm ears included.', art: { style: 'beanie', color: '#e0526b' } },
  { id: 'hair-wizard', slot: 'hair', name: 'Wizard Hat', rarity: 'epic', cost: 480, description: 'Sparkles included.', art: { style: 'wizard', color: '#4b3f8f' } },
  { id: 'hair-crown', slot: 'hair', name: 'Royal Crown', rarity: 'legendary', cost: 1000, description: 'For true champions.', art: { style: 'crown', color: '#ffd257' } },

  // Outfits -------------------------------------------------------------
  { id: 'outfit-tee', slot: 'outfit', name: 'Starter Tee', rarity: 'common', cost: 0, description: 'Comfy every day.', art: { style: 'tee', color: '#38bdf8', accent: '#0ea5e9' } },
  { id: 'outfit-hoodie', slot: 'outfit', name: 'Cozy Hoodie', rarity: 'common', cost: 150, description: 'With a big pocket.', art: { style: 'hoodie', color: '#6d6bff', accent: '#4f46e5' } },
  { id: 'outfit-dress', slot: 'outfit', name: 'Twirl Dress', rarity: 'rare', cost: 180, description: 'Made for spinning.', art: { style: 'dress', color: '#ff8fc7', accent: '#f472b6' } },
  { id: 'outfit-lab', slot: 'outfit', name: 'Lab Coat', rarity: 'rare', cost: 200, description: 'For science!', art: { style: 'lab', color: '#f4f7ff', accent: '#a5b4fc' } },
  { id: 'outfit-suit', slot: 'outfit', name: 'Smart Suit', rarity: 'rare', cost: 250, description: 'Sharp and ready.', art: { style: 'suit', color: '#2b3350', accent: '#ffd257' } },
  { id: 'outfit-cape', slot: 'outfit', name: 'Hero Cape', rarity: 'epic', cost: 350, description: 'Billows dramatically.', art: { style: 'cape', color: '#ef4444', accent: '#fbbf24' } },
  { id: 'outfit-armor', slot: 'outfit', name: 'Star Armor', rarity: 'epic', cost: 600, description: 'Shiny and sturdy.', art: { style: 'armor', color: '#8b93b8', accent: '#22d3ee' } },

  // Accessories ---------------------------------------------------------
  { id: 'accessory-none', slot: 'accessory', name: 'Nothing', rarity: 'common', cost: 0, description: 'Keep it natural.', art: { style: 'none', color: '#ffffff' } },
  { id: 'accessory-glasses', slot: 'accessory', name: 'Smart Glasses', rarity: 'common', cost: 100, description: 'Clever look.', art: { style: 'glasses', color: '#334155' } },
  { id: 'accessory-bow', slot: 'accessory', name: 'Hair Bow', rarity: 'common', cost: 120, description: 'A pop of color.', art: { style: 'bow', color: '#f472b6' } },
  { id: 'accessory-sunglasses', slot: 'accessory', name: 'Cool Shades', rarity: 'rare', cost: 150, description: 'Too cool.', art: { style: 'sunglasses', color: '#0f172a' } },
  { id: 'accessory-headphones', slot: 'accessory', name: 'Headphones', rarity: 'rare', cost: 220, description: 'Always in the zone.', art: { style: 'headphones', color: '#22d3ee' } },
  { id: 'accessory-mask', slot: 'accessory', name: 'Hero Mask', rarity: 'epic', cost: 240, description: 'Secret identity.', art: { style: 'mask', color: '#6366f1' } },
  { id: 'accessory-goggles', slot: 'accessory', name: 'Sky Goggles', rarity: 'epic', cost: 280, description: 'For high flyers.', art: { style: 'goggles', color: '#f59e0b' } },

  // Pets ----------------------------------------------------------------
  { id: 'pet-none', slot: 'pet', name: 'No Companion', rarity: 'common', cost: 0, description: 'Flying solo.', art: { style: 'none', color: '#ffffff' } },
  { id: 'pet-blob', slot: 'pet', name: 'Blob Pal', rarity: 'common', cost: 200, description: 'Wobbles happily.', art: { style: 'blob', color: '#5eead4' } },
  { id: 'pet-robot', slot: 'pet', name: 'Robot Buddy', rarity: 'common', cost: 250, description: 'Beeps when you win.', art: { style: 'robot', color: '#93c5fd' } },
  { id: 'pet-cat', slot: 'pet', name: 'Pocket Cat', rarity: 'rare', cost: 350, description: 'Purrs on demand.', art: { style: 'cat', color: '#fbbf24' } },
  { id: 'pet-owl', slot: 'pet', name: 'Night Owl', rarity: 'rare', cost: 450, description: 'The wisest friend.', art: { style: 'owl', color: '#a78bfa' } },
  { id: 'pet-star', slot: 'pet', name: 'Lil Star', rarity: 'epic', cost: 800, description: 'Glows with pride.', art: { style: 'star', color: '#fde047' } },
  { id: 'pet-dragonling', slot: 'pet', name: 'Baby Dragon', rarity: 'legendary', cost: 1500, description: 'Small but mighty.', art: { style: 'dragonling', color: '#fb7185' } },

  // Auras ---------------------------------------------------------------
  { id: 'aura-none', slot: 'aura', name: 'No Aura', rarity: 'common', cost: 0, description: 'Clean and simple.', art: { style: 'none', color: '#ffffff' } },
  { id: 'aura-sparkle', slot: 'aura', name: 'Sparkle', rarity: 'common', cost: 200, description: 'A little shimmer.', art: { style: 'sparkle', color: '#fef08a' } },
  { id: 'aura-electric', slot: 'aura', name: 'Electric', rarity: 'rare', cost: 400, description: 'Crackling energy.', art: { style: 'electric', color: '#22d3ee' } },
  { id: 'aura-flame', slot: 'aura', name: 'Flame', rarity: 'epic', cost: 500, description: 'Warm and fierce.', art: { style: 'flame', color: '#f97316' } },
  { id: 'aura-galaxy', slot: 'aura', name: 'Galaxy', rarity: 'epic', cost: 900, description: 'A swirl of stars.', art: { style: 'galaxy', color: '#a78bfa' } },
  { id: 'aura-rainbow', slot: 'aura', name: 'Rainbow', rarity: 'legendary', cost: 1500, description: 'Pure joy.', art: { style: 'rainbow', color: '#f472b6' } },
]

export function wardrobeById(id: string): WardrobeItem | undefined {
  return WARDROBE.find((w) => w.id === id)
}

export function itemsForSlot(slot: WardrobeSlot): WardrobeItem[] {
  return WARDROBE.filter((w) => w.slot === slot)
}

/** Ids of every item that's free from the start (owned without buying). */
export const DEFAULT_OWNED_WARDROBE: string[] = WARDROBE.filter((w) => w.cost === 0).map((w) => w.id)
