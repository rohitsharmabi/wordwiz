import { useMemo, useState } from 'react'
import type { Progress, Word } from '../types'
import { shuffle } from '../utils/helpers'
import { speak } from '../utils/speech'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Diff   = 'easy' | 'medium' | 'hard' | 'mixed'
type Step   = 'unscramble' | 'reveal'
type Rating = 'known' | 'almost' | 'unknown'

type Props = {
  words: Word[]
  progress: Progress
  updateProgress: (updates: Partial<Progress>) => void
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function makeScramble(word: string): string[] {
  const letters = word.toUpperCase().replace(/ /g, '').split('')
  let result: string[]
  let tries = 0
  do {
    result = [...letters].sort(() => Math.random() - 0.5)
    tries++
  } while (result.join('') === letters.join('') && tries < 30)
  return result
}

function blankSentence(sentence: string, word: string): string {
  return sentence.replace(new RegExp(word, 'i'), '_'.repeat(word.length))
}

// ─────────────────────────────────────────────
// Setup Screen
// ─────────────────────────────────────────────
const COUNTS = [5, 10, 15, 20]
const DIFFS: { val: Diff; icon: string; label: string }[] = [
  { val: 'easy',   icon: '🟢', label: 'Easy'   },
  { val: 'medium', icon: '🟡', label: 'Medium' },
  { val: 'hard',   icon: '🔴', label: 'Hard'   },
  { val: 'mixed',  icon: '🎲', label: 'Mixed'  },
]

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
        <button className="primary-btn" onClick={onStart}>
          🚀 Start Flashcards!
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Step 1 — Unscramble
// ─────────────────────────────────────────────
function UnscrambleStep({
  card,
  onSolved,
  onGiveUp,
}: {
  card: Word
  onSolved: (correct: boolean) => void
  onGiveUp: () => void
}) {
  const wordLetters = card.word.toUpperCase().replace(/ /g, '').split('')
  const [tiles]     = useState<string[]>(() => makeScramble(card.word))
  const [picked, setPicked]       = useState<number[]>([])
  const [attempt, setAttempt]     = useState(1)
  const [result, setResult]       = useState<'correct' | 'wrong' | null>(null)
  const [hintsUsed, setHintsUsed] = useState(0)

  const built    = picked.map(i => tiles[i]).join('')
  const maxHints = 3

  const tapTile = (i: number) => {
    if (result) return
    if (picked.includes(i)) {
      setPicked(p => p.filter(x => x !== i))
    } else if (picked.length < wordLetters.length) {
      setPicked(p => [...p, i])
    }
  }

  const tapSlot = (pos: number) => {
    if (result || pos < hintsUsed) return
    setPicked(p => p.filter((_, i) => i !== pos))
  }

  const useHint = () => {
    if (hintsUsed >= maxHints || result) return
    const pos     = hintsUsed
    const needed  = wordLetters[pos]
    const tileIdx = tiles.findIndex(
      (l, i) => l === needed && !picked.slice(0, pos).includes(i)
    )
    if (tileIdx === -1) return
    const next = [...picked]
    next.splice(pos, 0, tileIdx)
    setPicked(next.slice(0, wordLetters.length))
    setHintsUsed(h => h + 1)
  }

  const checkAnswer = () => {
    const correct = built.toLowerCase() === card.word.toLowerCase().replace(/ /g, '')
    if (correct) {
      setResult('correct')
      setTimeout(() => onSolved(true), 1300)
    } else if (attempt < 2) {
      setResult('wrong')
      setTimeout(() => {
        setResult(null)
        setPicked([])
        setAttempt(2)
      }, 1200)
    } else {
      setResult('wrong')
      setTimeout(() => onSolved(false), 1200)
    }
  }

  return (
    <div className="fc-unscramble-card">

      {/* attempt pips */}
      <div className="fc-attempt-row">
        <span className={`fc-pip ${attempt >= 1 ? 'on' : ''}`} />
        <span className={`fc-pip ${attempt >= 2 ? 'on' : ''}`} />
        <span className="fc-attempt-label">
          {result === 'correct'
            ? '🌟 Correct!'
            : result === 'wrong' && attempt === 2
              ? '❌ See the answer below'
              : result === 'wrong'
                ? '❌ Try once more!'
                : `Attempt ${attempt} of 2`}
        </span>
      </div>

      {/* clue box */}
      <div className="fc-clue-box">
        <div className="fc-clue-row">
          <span className="fc-clue-lbl">Meaning</span>
          <span className="fc-clue-txt">{card.definition}</span>
        </div>
        <div className="fc-clue-divider" />
        <div className="fc-clue-row">
          <span className="fc-clue-lbl">Example</span>
          <span className="fc-clue-txt" style={{ fontStyle: 'italic' }}>
            {blankSentence(card.example, card.word)}
          </span>
        </div>
        <div className="fc-clue-divider" />
        <div className="fc-clue-row">
          <span className="fc-clue-lbl">Category</span>
          <span className="fc-clue-chip">{card.category}</span>
        </div>
      </div>

      {/* answer slots */}
      <div className="fc-slots-row">
        {wordLetters.map((correctLetter, pos) => {
          const tileIdx = picked[pos]
          const letter  = tileIdx !== undefined ? tiles[tileIdx] : ''
          const isHint  = pos < hintsUsed
          const isRight = result === 'correct'
          const isWrong = result === 'wrong' && !!letter && letter !== correctLetter
          return (
            <div
              key={pos}
              className={[
                'fc-slot',
                letter  ? 'filled'       : '',
                isHint  ? 'hint-locked'  : '',
                isRight ? 'slot-correct' : '',
                isWrong ? 'slot-wrong'   : '',
              ].filter(Boolean).join(' ')}
              onClick={() => tapSlot(pos)}
            >
              {letter}
            </div>
          )
        })}
      </div>

      {/* tile bank */}
      <div className="fc-tile-bank">
        {tiles.map((letter, i) => (
          <button
            key={i}
            className={`fc-tile ${picked.includes(i) ? 'used' : ''}`}
            onClick={() => tapTile(i)}
            disabled={!!result}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* action buttons */}
      {!result && (
        <div className="fc-action-row">
          <button
            className="fc-action-btn hint"
            onClick={useHint}
            disabled={hintsUsed >= maxHints}
          >
            💡 Hint{hintsUsed > 0 ? ` (${maxHints - hintsUsed} left)` : ''}
          </button>
          <button
            className="fc-action-btn clear"
            onClick={() => setPicked([])}
          >
            🔄 Clear
          </button>
          <button
            className="fc-action-btn check"
            onClick={checkAnswer}
            disabled={built.length < wordLetters.length}
          >
            ✅ Check
          </button>
        </div>
      )}

      {/* give up */}
      {!result && (
        <button className="fc-giveup-btn" onClick={onGiveUp}>
          👀 Show me the word
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Step 2 — Reveal + Rate (single screen)
// ─────────────────────────────────────────────
function RevealStep({
  card,
  solvedCorrectly,
  onRate,
}: {
  card: Word
  solvedCorrectly: boolean
  onRate: (r: Rating) => void
}) {
  return (
    <div className={`fc-reveal-card ${solvedCorrectly ? 'won' : 'shown'}`}>
        {/* accent strip is rendered via ::before — no JSX needed */}

      <div className="fc-reveal-inner">

        {/* badge */}
        <div className="fc-reveal-badge">
          {solvedCorrectly ? '🌟 You got it!' : "💡 Here's the word"}
        </div>

        {/* word + definition + example */}
        <div className="fc-reveal-word">{card.word}</div>
        <div className="fc-reveal-def">{card.definition}</div>
        <div className="fc-reveal-example">"{card.example}"</div>

        {/* hear it */}
        <button
          className="fc-speak-btn"
          onClick={() =>
            speak(`${card.word}. ${card.definition}. For example: ${card.example}`)
          }
        >
          🔊 Hear it
        </button>

        {/* synonyms */}
        {card.synonyms.length > 0 && (
          <>
            <div className="fc-sa-label">Synonyms</div>
            <div className="syn-ant-row">
              {card.synonyms.map(s => (
                <span key={s} className="syn-chip syn">{s}</span>
              ))}
            </div>
          </>
        )}

        {/* antonyms */}
        {card.antonyms.length > 0 && (
          <>
            <div className="fc-sa-label">Antonyms</div>
            <div className="syn-ant-row">
              {card.antonyms.map(a => (
                <span key={a} className="syn-chip ant">{a}</span>
              ))}
            </div>
          </>
        )}

        {/* hear synonyms & antonyms */}
        {(card.synonyms.length > 0 || card.antonyms.length > 0) && (
          <button
            className="fc-speak-btn"
            style={{ marginTop: 8 }}
            onClick={() =>
              speak(
                `Synonyms for ${card.word}: ${card.synonyms.slice(0, 3).join(', ')}. ` +
                `Antonyms: ${card.antonyms.slice(0, 2).join(', ')}.`
              )
            }
          >
            🔊 Hear synonyms & antonyms
          </button>
        )}

        {/* ── rate buttons — no extra screen ── */}
        <div className="fc-rate-divider" />
        <div className="fc-rate-label-inline">How well did you know it?</div>
        <div className="fc-rate-buttons">
          <button className="fc-rate-btn unknown" onClick={() => onRate('unknown')}>
            <span className="fc-rate-emoji">😕</span>
            <span className="fc-rate-text">Didn't<br />know it</span>
          </button>
          <button className="fc-rate-btn almost" onClick={() => onRate('almost')}>
            <span className="fc-rate-emoji">🤔</span>
            <span className="fc-rate-text">Almost<br />got it</span>
          </button>
          <button className="fc-rate-btn known" onClick={() => onRate('known')}>
            <span className="fc-rate-emoji">✅</span>
            <span className="fc-rate-text">Got<br />it!</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main FlashcardScreen
// ─────────────────────────────────────────────
export default function FlashcardScreen({ words, progress, updateProgress }: Props) {
  const [ready,        setReady]        = useState(false)
  const [count,        setCount]        = useState(10)
  const [diff,         setDiff]         = useState<Diff>('mixed')
  const [queue,        setQueue]        = useState<Word[]>([])
  const [totalCards,   setTotalCards]   = useState(0)
  const [cardsDone,    setCardsDone]    = useState(0)
  const [step,         setStep]         = useState<Step>('unscramble')
  const [solvedOk,     setSolvedOk]     = useState(false)
  const [sessionScore, setSessionScore] = useState(0)
  const [done,         setDone]         = useState(false)

  const baseDeck = useMemo(() => {
    const pool = diff === 'mixed' ? words : words.filter(w => w.difficulty === diff)
    const safe = pool.length > 0 ? pool : words
    return shuffle(safe).slice(0, Math.min(count, safe.length))
  }, [words, diff, count])

  const startSession = () => {
    setQueue([...baseDeck])
    setTotalCards(baseDeck.length)
    setCardsDone(0)
    setSessionScore(0)
    setStep('unscramble')
    setSolvedOk(false)
    setDone(false)
    setReady(true)
  }

  if (!ready) {
    return (
      <FlashcardSetup
        count={count} setCount={setCount}
        diff={diff}   setDiff={setDiff}
        onStart={startSession}
      />
    )
  }

  if (done || queue.length === 0) {
    return (
      <div className="fc-done">
        <div className="fc-done-emoji">🎉</div>
        <h2>Session Complete!</h2>
        <p>
          You scored <strong>{sessionScore}</strong> out of{' '}
          <strong>{totalCards}</strong> cards.
        </p>
        <button
          className="secondary-btn"
          style={{ marginBottom: 8 }}
          onClick={startSession}
        >
          🔄 Go Again
        </button>
        <button className="primary-btn" onClick={() => setReady(false)}>
          ⚙️ Change Settings
        </button>
      </div>
    )
  }

  const card        = queue[0]
  const isMastered  = progress.masteredIds.includes(card.id)
  const isTricky    = progress.trickyIds.includes(card.id)
  const progressPct = Math.round((cardsDone / totalCards) * 100)

  const advance = (mode: 'drop' | 'end' | 'soon') => {
    setQueue(prev => {
      const [current, ...rest] = prev
      if (mode === 'drop') return rest
      if (mode === 'end')  return [...rest, current]
      const q = [...rest]
      q.splice(Math.min(2, q.length), 0, current)
      return q
    })
    setCardsDone(n => n + 1)
    setStep('unscramble')
    setSolvedOk(false)
    if (queue.length <= 1) setDone(true)
  }

  const handleSolved = (correct: boolean) => { setSolvedOk(correct); setStep('reveal') }
  const handleGiveUp = ()                  => { setSolvedOk(false);   setStep('reveal') }

  const handleRate = (rating: Rating) => {
    if (rating === 'unknown') {
      if (!progress.trickyIds.includes(card.id)) {
        updateProgress({ trickyIds: [...progress.trickyIds, card.id] })
      }
      advance('soon')
    } else if (rating === 'almost') {
      advance('end')
    } else {
      const newMastered = isMastered
        ? progress.masteredIds
        : [...progress.masteredIds, card.id]
      updateProgress({
        masteredIds: newMastered,
        mastered:    newMastered.length,
        stars:       progress.stars + 1,
        coins:       progress.coins + 2,
      })
      setSessionScore(s => s + 1)
      advance('drop')
    }
  }

  return (
    <div>
      {/* header */}
      <div className="fc-header">
        <h2>🃏 Flashcards</h2>
        <span className="fc-counter">
          {Math.min(cardsDone + 1, totalCards)} / {totalCards}
        </span>
      </div>

      {/* meta chips */}
      <div className="fc-meta-row">
        <span className={`fc-meta-chip diff-${diff}`}>
          {diff === 'easy'   ? '🟢 Easy'
           : diff === 'medium' ? '🟡 Medium'
           : diff === 'hard'   ? '🔴 Hard'
           :                     '🎲 Mixed'}
        </span>
        <span className="fc-meta-chip count">📚 {queue.length} left</span>
        {isTricky   && <span className="fc-meta-chip fc-chip-tricky">🌶️ Tricky</span>}
        {isMastered && <span className="fc-meta-chip fc-chip-mastered">✅ Mastered</span>}
      </div>

      {/* steps */}
      {step === 'unscramble' && (
        <UnscrambleStep
          key={`${card.id}-us`}
          card={card}
          onSolved={handleSolved}
          onGiveUp={handleGiveUp}
        />
      )}
      {step === 'reveal' && (
        <RevealStep
          key={`${card.id}-rv`}
          card={card}
          solvedCorrectly={solvedOk}
          onRate={handleRate}
        />
      )}

      {/* progress bar */}
      <div className="fc-progress-wrap" style={{ marginTop: 16 }}>
        <div className="fc-progress-label">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="fc-progress">
          <div className="fc-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
    </div>
  )
}
