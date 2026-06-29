import { useState } from 'react'
import type { Progress } from '../types'
import { SHOP_ITEMS, CATEGORY_LABELS, type ShopCategory } from '../constants/dragonShop'
import Dragon from './Dragon'

type Props = {
  progress: Progress
  updateProgress: (updates: Partial<Progress>) => void
  onClose: () => void
}

const CATEGORIES: ShopCategory[] = ['colour', 'hat', 'accessory', 'aura']

export default function DragonShopModal({ progress, updateProgress, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<ShopCategory>('colour')
  const { dragonState, coins } = progress

  const items = SHOP_ITEMS.filter(i => i.category === activeTab)

  const isUnlocked  = (id: string) => dragonState.unlockedIds.includes(id)
  const canAfford   = (cost: number) => coins >= cost

  const getEquipped = (cat: ShopCategory): string => {
    if (cat === 'colour')    return `colour-${dragonState.colour}`
    if (cat === 'hat')       return dragonState.hat === 'none' ? '' : `hat-${dragonState.hat}`
    if (cat === 'accessory') return dragonState.accessory === 'none' ? '' : `acc-${dragonState.accessory}`
    if (cat === 'aura')      return dragonState.aura === 'none' ? '' : `aura-${dragonState.aura}`
    return ''
  }

  const handleAction = (itemId: string, cost: number, cat: ShopCategory, value: string) => {
    const unlocked = isUnlocked(itemId)

    if (!unlocked) {
      if (!canAfford(cost)) return
      // Purchase
      const newUnlocked = [...dragonState.unlockedIds, itemId]
      const newDragon = { ...dragonState, unlockedIds: newUnlocked }
      applyEquip(newDragon, cat, value)
      updateProgress({ coins: coins - cost, dragonState: newDragon })
    } else {
      // Already owned — just equip/unequip
      const newDragon = { ...dragonState }
      const equipped = getEquipped(cat)
      if (equipped === itemId && cat !== 'colour') {
        applyEquip(newDragon, cat, 'none')
      } else {
        applyEquip(newDragon, cat, value)
      }
      updateProgress({ dragonState: newDragon })
    }
  }

  function applyEquip(d: typeof dragonState, cat: ShopCategory, value: string) {
    if (cat === 'colour')    d.colour    = value as typeof d.colour
    if (cat === 'hat')       d.hat       = value as typeof d.hat
    if (cat === 'accessory') d.accessory = value as typeof d.accessory
    if (cat === 'aura')      d.aura      = value as typeof d.aura
  }

  return (
    <div className="shop-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="shop-modal">

        {/* Header */}
        <div className="shop-header">
          <div className="shop-title">🐉 Dragon Shop</div>
          <div className="shop-coins">🪙 {coins} coins</div>
          <button
            className="shop-close-btn"
            style={{ background: '#fff3cd', color: '#856404', fontSize: '0.7rem', width: 'auto', borderRadius: 12, padding: '4px 8px' }}
            onClick={() => updateProgress({ coins: coins + 500 })}
            title="Dev: Add 500 coins"
          >
            +500🪙
          </button>
          <button className="shop-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Dragon preview */}
        <div className="shop-preview">
          <Dragon dragonState={dragonState} mood="happy" size={140} />
          <div className="shop-preview-label">Tap items to equip!</div>
        </div>

        {/* Category tabs */}
        <div className="shop-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`shop-tab ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Items grid */}
        <div className="shop-grid">
          {items.map(item => {
            const unlocked = isUnlocked(item.id)
            const equipped = getEquipped(item.category) === item.id
            const affordable = canAfford(item.cost)

            return (
              <div
                key={item.id}
                className={[
                  'shop-item',
                  equipped   ? 'equipped'   : '',
                  unlocked   ? 'owned'      : '',
                  !unlocked && !affordable ? 'locked' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => handleAction(item.id, item.cost, item.category, String(item.value))}
              >
                <div className="shop-item-emoji">{item.emoji}</div>
                <div className="shop-item-name">{item.name}</div>
                <div className="shop-item-desc">{item.description}</div>
                <div className="shop-item-footer">
                  {equipped ? (
                    <span className="shop-badge equipped-badge">✅ Equipped</span>
                  ) : unlocked ? (
                    <span className="shop-badge owned-badge">👆 Equip</span>
                  ) : (
                    <span className={`shop-badge cost-badge ${!affordable ? 'cant-afford' : ''}`}>
                      🪙 {item.cost}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
