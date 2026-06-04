import { useState } from 'react'
import { BADGES } from '../constants/badges'
import type { Progress, Word } from '../types'
import { speak } from '../utils/speech'

type Props = {
  words: Word[]
  progress: Progress
}

export default function HomeScreen({ words, progress }: Props) {
  const [showExtras, setShowExtras] = useState(false)

  const wotd = words[new Date().getDate() % words.length]
  const due = progress.reviewList.filter(r => new Date(r.reviewAfter) <= new Date()).length
  const earned = BADGES.filter(b => progress.earnedBadges.includes(b.id))
  const locked = BADGES.filter(b => !progress.earnedBadges.includes(b.id))

  return (
    <div>
      {due > 0 && <div className="review-alert">📅 {due} word(s) due for review today</div>}

      <div className="hero-card">
        <div className="label">Word of the Day</div>
        <h2>{wotd.word}</h2>
        <p>{wotd.definition}</p>
        <div className="example">"{wotd.example}"</div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          <button
            className="small-btn"
            onClick={() => speak(`${wotd.word}. ${wotd.definition}. For example: ${wotd.example}`)}
          >
            🔊 Hear
          </button>

          <button
            className="small-btn"
            onClick={() => setShowExtras(v => !v)}
          >
            {showExtras ? 'Hide synonyms & antonyms' : 'Show synonyms & antonyms'}
          </button>
        </div>

        {showExtras && (
          <div style={{ marginTop: 14 }}>
            {wotd.synonyms?.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <strong>Synonyms:</strong> {wotd.synonyms.join(', ')}
              </div>
            )}

            {wotd.antonyms?.length > 0 && (
              <div>
                <strong>Antonyms:</strong> {wotd.antonyms.join(', ')}
              </div>
            )}
          </div>
        )}
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
