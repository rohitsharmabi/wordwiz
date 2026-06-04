export type Difficulty = 'easy' | 'medium' | 'hard'

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
}

export type Badge = {
  id: string
  icon: string
  label: string
  condition: (progress: Progress) => boolean
}
