import { useCallback, useEffect, useState } from 'react'
import TopBar from './components/TopBar'
import BottomNav from './components/BottomNav'
import HomeScreen from './screens/HomeScreen'
import FlashcardScreen from './screens/FlashcardScreen'
import QuizScreen from './screens/QuizScreen'
import ChallengeScreen from './screens/ChallengeScreen'
import WordListScreen from './screens/WordListScreen'
import { BADGES } from './constants/badges'
import { loadProgress, saveProgress, updateStreak } from './utils/storage'
import type { Progress, Word } from './types'

type Tab = 'home' | 'flashcard' | 'quiz' | 'challenge' | 'wordlist'

export default function App() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('home')
  const [progress, setProgress] = useState<Progress>(() => updateStreak(loadProgress()))

  useEffect(() => {
    fetch('/words.json')
      .then(r => r.json())
      .then((data: Word[]) => {
        setWords(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load words.json', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const updateProgress = useCallback((updates: Partial<Progress>) => {
    setProgress(prev => {
      const next = { ...prev, ...updates }
      const newBadges = BADGES
        .filter(b => !next.earnedBadges.includes(b.id) && b.condition(next))
        .map(b => b.id)

      return newBadges.length
        ? { ...next, earnedBadges: [...next.earnedBadges, ...newBadges] }
        : next
    })
  }, [])

  if (loading) return <div className="loading">Loading words…</div>
  if (!words.length) return <div className="loading">Could not load words.json</div>

  return (
    <div>
      <TopBar progress={progress} />

      <main className="screen">
        {tab === 'home' && <HomeScreen words={words} progress={progress} />}
        {tab === 'flashcard' && <FlashcardScreen words={words} progress={progress} updateProgress={updateProgress} />}
        {tab === 'quiz' && <QuizScreen words={words} progress={progress} updateProgress={updateProgress} />}
        {tab === 'challenge' && <ChallengeScreen words={words} progress={progress} updateProgress={updateProgress} />}
        {tab === 'wordlist' && <WordListScreen words={words} progress={progress} updateProgress={updateProgress} />}
      </main>

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}
