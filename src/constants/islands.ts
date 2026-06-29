// src/constants/islands.ts
export type IslandDef = {
    id: string
    label: string
    category: string
    icon: string
    color: string
    rewardStars: number
    rewardBadgeId: string
  }
  
  export const ISLANDS: IslandDef[] = [
    {
      id: 'character-traits',
      label: 'Character Cove',
      category: 'Character Traits',
      icon: '🦸',
      color: '#667eea',
      rewardStars: 10,
      rewardBadgeId: 'island_character_traits',
    },
    {
      id: 'emotions',
      label: 'Emotion Isle',
      category: 'Emotions',
      icon: '😊',
      color: '#f5576c',
      rewardStars: 10,
      rewardBadgeId: 'island_emotions',
    },
    {
      id: 'communication',
      label: 'Speech Shore',
      category: 'Communication',
      icon: '🗣️',
      color: '#43e97b',
      rewardStars: 10,
      rewardBadgeId: 'island_communication',
    },
    {
      id: 'description',
      label: 'Description Dunes',
      category: 'Description',
      icon: '🔍',
      color: '#f6b73c',
      rewardStars: 10,
      rewardBadgeId: 'island_description',
    },
    {
      id: 'thinking-reasoning',
      label: 'Reasoning Reef',
      category: 'Thinking And Reasoning',
      icon: '🧠',
      color: '#764ba2',
      rewardStars: 10,
      rewardBadgeId: 'island_thinking_reasoning',
    },
    {
      id: 'behaviour',
      label: 'Behaviour Bay',
      category: 'Behaviour',
      icon: '⚡',
      color: '#00c6ff',
      rewardStars: 10,
      rewardBadgeId: 'island_behaviour',
    },
  ]
  