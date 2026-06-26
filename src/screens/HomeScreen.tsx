import { useState } from 'react'
import { BADGES } from '../constants/badges'
import type { Progress, Word } from '../types'
import { speak } from '../utils/speech'
import Dragon from '../components/Dragon'
import DragonShopModal from '../components/DragonShopModal'
import type { DragonMood } from '../components/Dragon'

type Props = {
  words: Word[]
  progress: Progress
  updateProgress: (updates: Partial<Progress>) => void
}

export default function HomeScreen({ words, progress, updateProgress }: Props) {
  const [shopOpen, setShopOpen] = useState(false)
  const [dragonMood, setDragonMood] = useState<DragonMood>('idle')

  const wotd = words[new Date().getDate() % words.length]
  const due = progress.reviewList.filter(r => new Date(r.reviewAfter) <= new Date()).length
  const earned = BADGES.filter(b => progress.earnedBadges.includes(b.id))
  const locked = BADGES.filter(b => !progress.earnedBadges.includes(b.id))

  // Dragon mood logic
  const mood: DragonMood = progress.streak === 0
    ? 'sleepy'
    : dragonMood !== 'idle'
      ? dragonMood
      : 'idle'

  const handleDragonClick = () => {
    setDragonMood('happy')
    setTimeout(() => setDragonMood('idle'), 1500)
    setShopOpen(true)
  }

  return (
    <div>
      {/* Dragon companion — compact horizontal strip */}
      <div className="dragon-home-section" onClick={handleDragonClick} role="button" aria-label="Open Dragon Shop">
        <Dragon
          dragonState={progress.dragonState}
          mood={mood}
          size={80}
        />
        <div className="dragon-home-info">
          <div className="dragon-speech-bubble">
            {progress.streak === 0
              ? "Wake me up when you study! 😴"
              : progress.streak >= 7
                ? `${progress.streak} days strong! You're legendary! 🔥`
                : `Day ${progress.streak}! Keep it up! 🌟`}
          </div>
          <div className="dragon-tap-hint">👆 Tap to customise!</div>
        </div>
      </div>

      {shopOpen && (
        <DragonShopModal
          progress={progress}
          updateProgress={updateProgress}
          onClose={() => setShopOpen(false)}
        />
      )}

      {due > 0 && <div className="review-alert">📅 {due} word(s) due for review today</div>}

      <div className="hero-card">
        <div className="label">Word of the Day</div>
        <h2>{wotd.word}</h2>
        <p>{wotd.definition}</p>
        <div className="example">"{wotd.example}"</div>
        <button className="small-btn" onClick={() => speak(`${wotd.word}. ${wotd.definition}`)}>
          🔊 Hear
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card"><div>⭐</div><strong>{progress.stars}</strong><span>Stars</span></div>
        <div className="stat-card"><div>🏅</div><strong>{progress.mastered}</strong><span>Mastered</span></div>
        <div className="stat-card"><div>🧠</div><strong>{progress.quizzesDone}</strong><span>Quizzes</span></div>
      </div>

      <h3 className="section-title">Badges</h3>
      <div className="badges">
        {earned.map(b => <span key={b.id} className="badge earned">{b.icon} {b.label}</span>)}
        {locked.map(b => <span key={b.id} className="badge">🔒 {b.label}</span>)}
      </div>
    </div>
  )
}
