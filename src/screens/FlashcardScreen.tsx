import { useMemo, useState } from 'react'
import type { Progress, Word } from '../types'
import { shuffle } from '../utils/helpers'
import { speak } from '../utils/speech'

type Props = {
  words: Word[]
  progress: Progress
  updateProgress: (updates: Partial<Progress>) => void
}

export default function FlashcardScreen({ words, progress, updateProgress }: Props) {
  const [ready, setReady] = useState(false)
  const [count, setCount] = useState(10)
  const [diff, setDiff] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed')
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const deck = useMemo(() => {
    if (!ready) return []
    const pool = diff === 'mixed' ? words : words.filter(w => w.difficulty === diff)
    const safe = pool.length ? pool : words
    return shuffle(safe).slice(0, Math.min(count, safe.length))
  }, [ready, count, diff, words])

  if (!ready) {
    return (
      <div>
        <h2>Flashcard Setup</h2>
        <p className="muted">Choose how many cards and difficulty.</p>

        <div className="option-grid">
          {[5, 10, 15, 20].map(c => (
            <button key={c} className={`tile ${count === c ? 'selected' : ''}`} onClick={() => setCount(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="option-grid four">
          {['easy', 'medium', 'hard', 'mixed'].map(d => (
            <button
              key={d}
              className={`tile ${diff === d ? 'selected' : ''}`}
              onClick={() => setDiff(d as 'easy' | 'medium' | 'hard' | 'mixed')}
            >
              {d}
            </button>
          ))}
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setIndex(0)
            setFlipped(false)
            setReady(true)
          }}
        >
          Start Flashcards
        </button>
      </div>
    )
  }

  const card = deck[index]
  const isMastered = progress.masteredIds.includes(card.id)
  const isTricky = progress.trickyIds.includes(card.id)

  const toggleMaster = () => {
    const newIds = isMastered
      ? progress.masteredIds.filter(id => id !== card.id)
      : [...progress.masteredIds, card.id]

    updateProgress({ masteredIds: newIds, mastered: newIds.length })
  }

  const toggleTricky = () => {
    const newIds = isTricky
      ? progress.trickyIds.filter(id => id !== card.id)
      : [...progress.trickyIds, card.id]

    updateProgress({ trickyIds: newIds })
  }

  return (
    <div>
      <div className="row-between">
        <h2>Flashcards</h2>
        <span className="pill">{index + 1} / {deck.length}</span>
      </div>

      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
        {!flipped ? (
          <div className="flash-front">
            <h1>{card.word}</h1>
            <div className="muted">{card.difficulty}</div>
            <button
              className="small-btn"
              onClick={e => {
                e.stopPropagation()
                speak(card.word)
              }}
            >
              🔊 Hear
            </button>
          </div>
        ) : (
          <div className="flash-back">
            <p><strong>{card.definition}</strong></p>
            <p className="example">"{card.example}"</p>
            <div><strong>Synonyms:</strong> {(card.synonyms || []).join(', ')}</div>
            <div><strong>Antonyms:</strong> {(card.antonyms || []).join(', ')}</div>
          </div>
        )}
      </div>

      <div className="actions four-actions">
        <button onClick={() => { setFlipped(false); setTimeout(() => setIndex(i => (i - 1 + deck.length) % deck.length), 100) }}>Prev</button>
        <button onClick={toggleMaster}>{isMastered ? '✅ Mastered' : '⭐ Master'}</button>
        <button onClick={toggleTricky}>🌶️ Tricky</button>
        <button onClick={() => { setFlipped(false); setTimeout(() => setIndex(i => (i + 1) % deck.length), 100) }}>Next</button>
      </div>

      <button className="secondary-btn" onClick={() => setReady(false)}>Change Settings</button>
    </div>
  )
}
