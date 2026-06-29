export type Difficulty = 'easy' | 'medium' | 'hard'

export type DragonColour = 'green' | 'blue' | 'purple' | 'gold' | 'red' | 'pink' | 'teal'
export type DragonHat = 'none' | 'party' | 'wizard' | 'crown' | 'viking' | 'graduation'
export type DragonAccessory = 'none' | 'bowtie' | 'glasses' | 'scarf' | 'cape' | 'monocle'
export type DragonAura = 'none' | 'sparkles' | 'fire' | 'ice' | 'rainbow' | 'stars'

export type DragonState = {
  colour: DragonColour
  hat: DragonHat
  accessory: DragonAccessory
  aura: DragonAura
  unlockedIds: string[]
}

export type Word = {
  id: number
  word: string
  definition: string
  example: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  synonyms: string[]
  antonyms: string[]
}

export type ReviewItem = {
  id: number
  reviewAfter: string
}

export type Progress = {
  stars: number
  coins: number
  mastered: number
  quizzesDone: number
  perfectQuizzes: number
  challengesDone: number
  streak: number
  lastVisit: string | null
  masteredIds: number[]
  trickyIds: number[]
  earnedBadges: string[]
  reviewList: ReviewItem[]
  journeyLearnedIds: number[]
  completedIslandIds: string[]
  dragonState: DragonState
}

export type Badge = {
  id: string
  icon: string
  label: string
  condition: (progress: Progress) => boolean
}
