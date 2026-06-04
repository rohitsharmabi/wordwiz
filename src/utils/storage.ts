// src/utils/storage.ts
import type { Progress } from '../types'

export function defaultProgress(): Progress {
  return {
    stars: 0,
    mastered: 0,
    quizzesDone: 0,
    perfectQuizzes: 0,
    challengesDone: 0,
    streak: 0,
    lastVisit: null,
    masteredIds: [],
    journeyLearnedIds: [],
    completedIslandIds: [],
    trickyIds: [],
    earnedBadges: [],
    reviewList: [],
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
