import type { Badge } from '../types'

export const BADGES: Badge[] = [
  { id: 'first_star', icon: '⭐', label: 'First Star', condition: s => s.stars >= 1 },
  { id: 'quiz_done', icon: '🧠', label: 'Quiz Starter', condition: s => s.quizzesDone >= 1 },
  { id: 'challenge_done', icon: '🎤', label: 'First Challenge', condition: s => s.challengesDone >= 1 },
  { id: 'mastered_10', icon: '🏅', label: '10 Mastered', condition: s => s.mastered >= 10 },
  { id: 'mastered_25', icon: '🥈', label: '25 Mastered', condition: s => s.mastered >= 25 },
  { id: 'mastered_50', icon: '🏆', label: 'All 50!', condition: s => s.mastered >= 50 },
]
