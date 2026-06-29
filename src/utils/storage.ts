// src/utils/storage.ts
import type { Progress } from '../types'
import { DEFAULT_DRAGON_UNLOCKED } from '../constants/dragonShop'

export function defaultProgress(): Progress {
  return {
    stars: 500, // Changed from 0 to 500 to give users a starting point for testing and engagement
    coins: 500, // Changed from 0 to 500 to give users a starting point for testing and engagement
    mastered: 0,
    quizzesDone: 0,
    perfectQuizzes: 0,
    challengesDone: 0,
    streak: 0,
    lastVisit: null,
    masteredIds: [],
    journeyLearnedIds: [],
    completedIslandIds: [],
    starUnlockedIslandIds: [],
    trickyIds: [],
    earnedBadges: [],
    reviewList: [],
    dragonState: {
      colour: 'green',
      hat: 'none',
      accessory: 'none',
      aura: 'none',
      unlockedIds: [...DEFAULT_DRAGON_UNLOCKED],
    },
  }
}

export function loadProgress(): Progress {
  try {
    const p = JSON.parse(localStorage.getItem('wordwiz_progress') || 'null')
    return p ? { ...defaultProgress(), ...p } : defaultProgress()
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(progress: Progress): void {
  localStorage.setItem('wordwiz_progress', JSON.stringify(progress))
}

export function updateStreak(progress: Progress): Progress {
  const today = new Date().toDateString()
  if (progress.lastVisit === today) return progress

  const yesterday = new Date(Date.now() - 86400000).toDateString()

  return {
    ...progress,
    streak: progress.lastVisit === yesterday ? progress.streak + 1 : 1,
    lastVisit: today,
  }
}
