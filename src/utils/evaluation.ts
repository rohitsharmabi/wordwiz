import type { Word } from '../types'

export type EvaluationResult = {
  score: number
  grade: 'great' | 'good' | 'needs'
  feedback: string
}

export function evaluateMeaning(userText: string, word: Word): EvaluationResult {
  if (!userText || userText.trim().length < 5) {
    return { score: 0, grade: 'needs', feedback: 'Try to write at least a few words!' }
  }

  const ut = userText.toLowerCase()
  const keywords = [
    ...word.definition.toLowerCase().split(/\W+/).filter(w => w.length > 3),
    ...(word.synonyms || []).map(s => s.toLowerCase()),
  ]

  const hits = keywords.filter(k => ut.includes(k)).length
  const ratio = hits / Math.max(keywords.length, 1)

  if (ratio >= 0.35) {
    return { score: 3, grade: 'great', feedback: 'Excellent! You clearly understand this word.' }
  }

  if (ratio >= 0.15) {
    return { score: 2, grade: 'good', feedback: "Good try! You've got the right idea." }
  }

  return { score: 1, grade: 'needs', feedback: 'Not quite — have a look at the definition below.' }
}

export function evaluateSentence(userText: string, word: Word): EvaluationResult {
  if (!userText || userText.trim().length < 8) {
    return { score: 0, grade: 'needs', feedback: 'Write a full sentence please!' }
  }

  const ut = userText.toLowerCase()
  const hasWord = ut.includes(word.word.toLowerCase())
  const isLong = userText.trim().split(' ').length >= 5

  if (hasWord && isLong) {
    return { score: 3, grade: 'great', feedback: 'Great sentence! You used the word correctly.' }
  }

  if (isLong) {
    return { score: 2, grade: 'good', feedback: `Good sentence! Try to include "${word.word}" in it.` }
  }

  return { score: 1, grade: 'needs', feedback: 'Write a longer sentence using the word.' }
}
