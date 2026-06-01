import { useMemo, useState } from 'react'
import type { Progress, Word } from '../types'
import { shuffle } from '../utils/helpers'
import { speak } from '../utils/speech'

type Props = {
  words: Word[]
  progress: Progress
  updateProgress: (updates: Partial<Progress>) => void
}

type Diff = 'easy' | 'medium' | 'hard' | 'mixed'

const COUNTS = [5, 10, 15, 20]
const DIFFS: { val: Diff; icon: string; label: string }[] = [
  { val: 'easy',   icon: '🟢', label: 'Easy'   },
  { val: 'medium', icon: '🟡', label: 'Medium' },
  { val: 'hard',   icon: '🔴', label: 'Hard'   },
  { val: 'mixed',  icon: '🎲', label: 'Mixed'  },
]

// ── Setup screen ──────────────────────────────────────────────
function FlashcardSetup({
  count, setCount, diff, setDiff, onStart,
}: {
  count: number
  setCount: (n: number) => void
  diff: Diff
  setDiff: (d: Diff) => void
  onStart: () => void
}) {
  return (
    <div className="setup-screen">
      <h2>🃏 Flashcard Setup</h2>
      <p>Choose how many cards and which difficulty level you'd like to practise today.</p>

      <div className="setup-label">How many cards?</div>
      <div className="option-grid">
        {COUNTS.map(c => (
          <div
            key={c}
            className={`option-tile ${count === c ? 'selected' : ''}`}
            onClick={() => setCount(c)}
          >
            <div className="tile-icon">
              {c === 5 ? '✋' : c === 10 ? '🖐️✋' : c === 15 ? '💪' : '🏋️'}
            </div>
            <div className="tile-val">{c}</div>
            <div className="tile-lbl">cards</div>
          </div>
        ))}
      </div>

      <div className="setup-label">Difficulty level?</div>
      <div className="diff-grid">
        {DIFFS.map(d => (
          <div
            key={d.val}
            className={`diff-tile ${diff === d.val ? `sel-${d.val}` : ''}`}
            onClick={() => setDiff(d.val)}
          >
            <div className="dt-icon">{d.icon}</div>
            <div className="dt-lbl">{d.label}</div>
          </div>
        ))}
      </div>

      <div className="start-btn-wrap">
        <button className="big-btn primary" onClick={onStart}>
          🚀 Start Flashcards!
        </button>
      </div>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────
export default function FlashcardScreen({ words, progress, updateProgress }: Props) {
  const [ready, setReady]   = useState(false)
  const [count, setCount]   = useState(10)
  const [diff, setDiff]     = useState<Diff>('mixed')
  const [index, setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)

  const deck = useMemo(() => {
    if (!ready) return []
    const pool = diff === 'mixed' ? words : words.filter(w => w.difficulty === diff)
    const safe = pool.length > 0 ? pool : words
    return shuffle(safe).slice(0, Math.min(count, safe.length))
  }, [ready, count, diff, words])

  if (!ready) {
    return (
      <FlashcardSetup
        count={count} setCount={setCount}
        diff={diff}   setDiff={setDiff}
        onStart={() => { setIndex(0); setFlipped(false); setReady(true) }}
      />
    )
  }

  if (deck.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontWeight: 700 }}>
        No words found for that filter 🔍
      </div>
    )
  }

  const card       = deck[index]
  const isMastered = progress.masteredIds.includes(card.id)
  const isTricky   = (progress.trickyIds ?? []).includes(card.id)
  const isLast     = index === deck.length - 1

  const go = (dir: number) => {
    setFlipped(false)
    setTimeout(() => setIndex(i => (i + dir + deck.length) % deck.length), 150)
  }

  const toggleMaster = () => {
    const newIds = isMastered
      ? progress.masteredIds.filter(id => id !== card.id)
      : [...progress.masteredIds, card.id]
    updateProgress({ masteredIds: newIds, mastered: newIds.length })
  }

  const toggleTricky = () => {
    const cur    = progress.trickyIds ?? []
    const newIds = isTricky
      ? cur.filter(id => id !== card.id)
      : [...cur, card.id]
    updateProgress({ trickyIds: newIds })
  }

  return (
    <div>
      {/* Header */}
      <div className="fc-header">
        <h2>🃏 Flashcards</h2>
        <span className="fc-counter">{index + 1} / {deck.length}</span>
      </div>

      {/* Session meta chips */}
      <div className="fc-meta-row">
        <span className={`fc-meta-chip diff-${diff}`}>
          {diff === 'mixed' ? '🎲 Mixed'
            : diff === 'easy'   ? '🟢 Easy'
            : diff === 'medium' ? '🟡 Medium'
            :                     '🔴 Hard'}
        </span>
        <span className="fc-meta-chip count">📚 {deck.length} cards</span>
        {isTricky && (
          <span className="fc-meta-chip" style={{ background: '#fff0f2', color: '#c0392b' }}>
            🌶️ Tricky
          </span>
        )}
      </div>

      {/* Flip card */}
      <div className="flashcard-wrap" onClick={() => setFlipped(f => !f)}>
        <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>

          {/* Front */}
          <div className="card-face card-front">
            <div className="word">{card.word}</div>
            <div className="diff-badge">{card.difficulty}</div>
            <button
              className="speak-btn"
              onClick={e => { e.stopPropagation(); speak(card.word) }}
            >
              🔊
            </button>
            <div className="tap-hint">👆 Tap to reveal</div>
          </div>

          {/* Back */}
          <div className="card-face card-back">
            <div className="def">{card.definition}</div>
            <div className="example">"{card.example}"</div>
            {card.synonyms && card.synonyms.length > 0 && (
              <>
                <div className="syn-ant-label">Synonyms</div>
                <div className="syn-ant-row">
                  {card.synonyms.map(s => (
                    <span key={s} className="syn-chip syn">{s}</span>
                  ))}
                </div>
              </>
            )}
            {card.antonyms && card.antonyms.length > 0 && (
              <>
                <div className="syn-ant-label">Antonyms</div>
                <div className="syn-ant-row">
                  {card.antonyms.map(a => (
                    <span key={a} className="syn-chip ant">{a}</span>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* 4-button control row */}
      <div className="fc-controls">
        <button className="fc-btn prev"   onClick={() => go(-1)}>← Prev</button>
        <button className="fc-btn mark"   onClick={toggleMaster}>
          {isMastered ? '✅' : '⭐'} {isMastered ? 'Done' : 'Master'}
        </button>
        <button className="fc-btn tricky" onClick={toggleTricky}>🌶️ Tricky</button>
        <button className="fc-btn next"   onClick={() => go(1)}>Next →</button>
      </div>

      {/* Progress bar */}
      <div className="fc-progress-wrap">
        <div className="fc-progress-label">
          <span>Progress</span>
          <span>{Math.round(((index + 1) / deck.length) * 100)}%</span>
        </div>
        <div className="fc-progress">
          <div
            className="fc-progress-fill"
            style={{ width: `${((index + 1) / deck.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Done banner on last card */}
      {isLast && flipped && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#667eea', marginBottom: 12 }}>
            🎉 You've been through all {deck.length} cards!
          </div>
          <button
            className="big-btn secondary"
            style={{ marginBottom: 8 }}
            onClick={() => { setIndex(0); setFlipped(false) }}
          >
            🔄 Go Again
          </button>
          <button className="big-btn primary" onClick={() => setReady(false)}>
            ⚙️ Change Settings
          </button>
        </div>
      )}
    </div>
  )
}
