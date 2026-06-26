import type { DragonAura, DragonAccessory, DragonColour, DragonHat } from '../types'

export type ShopCategory = 'colour' | 'hat' | 'accessory' | 'aura'

export type ShopItem = {
  id: string
  name: string
  category: ShopCategory
  cost: number
  emoji: string
  description: string
  value: DragonColour | DragonHat | DragonAccessory | DragonAura
}

export const SHOP_ITEMS: ShopItem[] = [
  // ── Colours ──────────────────────────────────────────
  {
    id: 'colour-green',
    name: 'Forest Green',
    category: 'colour',
    cost: 0,
    emoji: '🟢',
    description: 'The classic dragon look!',
    value: 'green',
  },
  {
    id: 'colour-blue',
    name: 'Ocean Blue',
    category: 'colour',
    cost: 15,
    emoji: '🔵',
    description: 'Cool as the deep ocean.',
    value: 'blue',
  },
  {
    id: 'colour-purple',
    name: 'Royal Purple',
    category: 'colour',
    cost: 20,
    emoji: '🟣',
    description: 'Fit for a dragon of great wisdom!',
    value: 'purple',
  },
  {
    id: 'colour-pink',
    name: 'Bubblegum Pink',
    category: 'colour',
    cost: 25,
    emoji: '🩷',
    description: 'Super sweet and super strong!',
    value: 'pink',
  },
  {
    id: 'colour-teal',
    name: 'Mystic Teal',
    category: 'colour',
    cost: 40,
    emoji: '🫐',
    description: 'A rare and magical hue.',
    value: 'teal',
  },
  {
    id: 'colour-red',
    name: 'Flame Red',
    category: 'colour',
    cost: 80,
    emoji: '🔴',
    description: 'Hot like dragon fire!',
    value: 'red',
  },
  {
    id: 'colour-gold',
    name: 'Legendary Gold',
    category: 'colour',
    cost: 150,
    emoji: '🌟',
    description: 'Only the most legendary dragons shine like this.',
    value: 'gold',
  },

  // ── Hats ─────────────────────────────────────────────
  {
    id: 'hat-party',
    name: 'Party Hat',
    category: 'hat',
    cost: 10,
    emoji: '🎉',
    description: 'Every day is a celebration!',
    value: 'party',
  },
  {
    id: 'hat-graduation',
    name: 'Graduation Cap',
    category: 'hat',
    cost: 30,
    emoji: '🎓',
    description: 'For the smartest dragon in class.',
    value: 'graduation',
  },
  {
    id: 'hat-wizard',
    name: 'Wizard Hat',
    category: 'hat',
    cost: 60,
    emoji: '🧙',
    description: 'Cast spells of knowledge!',
    value: 'wizard',
  },
  {
    id: 'hat-viking',
    name: 'Viking Helmet',
    category: 'hat',
    cost: 90,
    emoji: '⛵',
    description: 'Brave and bold, just like a Viking!',
    value: 'viking',
  },
  {
    id: 'hat-crown',
    name: 'Royal Crown',
    category: 'hat',
    cost: 175,
    emoji: '👑',
    description: 'Bow down — the dragon king has arrived!',
    value: 'crown',
  },

  // ── Accessories ───────────────────────────────────────
  {
    id: 'acc-bowtie',
    name: 'Bow Tie',
    category: 'accessory',
    cost: 10,
    emoji: '🎀',
    description: 'Fancy and fabulous!',
    value: 'bowtie',
  },
  {
    id: 'acc-glasses',
    name: 'Cool Glasses',
    category: 'accessory',
    cost: 20,
    emoji: '🕶️',
    description: 'Looking smart has never looked so cool.',
    value: 'glasses',
  },
  {
    id: 'acc-scarf',
    name: 'Cosy Scarf',
    category: 'accessory',
    cost: 35,
    emoji: '🧣',
    description: 'Warm and snuggly on cold study nights.',
    value: 'scarf',
  },
  {
    id: 'acc-monocle',
    name: 'Monocle',
    category: 'accessory',
    cost: 55,
    emoji: '🧐',
    description: 'Most distinguished indeed!',
    value: 'monocle',
  },
  {
    id: 'acc-cape',
    name: 'Hero Cape',
    category: 'accessory',
    cost: 120,
    emoji: '🦸',
    description: 'A vocabulary superhero!',
    value: 'cape',
  },

  // ── Auras ─────────────────────────────────────────────
  {
    id: 'aura-sparkles',
    name: 'Sparkle Aura',
    category: 'aura',
    cost: 25,
    emoji: '✨',
    description: 'Glittering with brilliance!',
    value: 'sparkles',
  },
  {
    id: 'aura-fire',
    name: 'Fire Aura',
    category: 'aura',
    cost: 50,
    emoji: '🔥',
    description: 'On fire with knowledge!',
    value: 'fire',
  },
  {
    id: 'aura-ice',
    name: 'Ice Aura',
    category: 'aura',
    cost: 70,
    emoji: '❄️',
    description: 'Cool, calm and collected.',
    value: 'ice',
  },
  {
    id: 'aura-stars',
    name: 'Star Shower',
    category: 'aura',
    cost: 100,
    emoji: '⭐',
    description: 'A shower of stars follows you everywhere!',
    value: 'stars',
  },
  {
    id: 'aura-rainbow',
    name: 'Rainbow Aura',
    category: 'aura',
    cost: 200,
    emoji: '🌈',
    description: 'The rarest aura of all. Pure magic!',
    value: 'rainbow',
  },
]

export const DEFAULT_DRAGON_UNLOCKED = ['colour-green']

export const CATEGORY_LABELS: Record<ShopCategory, string> = {
  colour: '🎨 Colours',
  hat: '🎩 Hats',
  accessory: '💎 Accessories',
  aura: '✨ Auras',
}
