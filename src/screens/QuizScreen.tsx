import { useState } from 'react'
import type { Progress, Word } from '../types'
import { shuffle } from '../utils/helpers'

type QuizQuestion = {
  word: Word
  correctId: number
  options: Word[]
}

type Props = {
  words: Word[]
  progress: Progress
  updateProgress: (updates: Partial<Progress>) => void
}

function buildQuiz(words: Word[]): QuizQuestion[] {
  return shuffle(words).slice(0, 10).map(word => ({
    word,
    correctId: word.id,
    options: shuffle([
      word,
      ...shuffle(words.filter(w => w.id !== word.id)).slice(0, 3),
    ]),
  }))
}

export default function QuizScreen({ words, progress, updateProgress }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => buildQuiz(words))
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correct, setCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [dotStates, setDotStates] = useState<Array<'' | 'done' | 'wrong'>>(Array(10).fill(''))
  const [done, setDone] = useState(false)

  const q = questions[qIndex]

  const handleAnswer = (opt: Word) => {
    if (selected !== null) return
    const isCorrect = opt.id === q.correctId
    setSelected(opt.id)
    setCorrect(isCorrect)
    if (isCorrect) setScore(s => s + 1)
    setDotStates(prev => {
      const next = [...prev] as Array<'' | 'done' | 'wrong'>
      next[qIndex] = isCorrect ? 'done' : 'wrong'
      return next
    })
  }

  const handleNext = () => {
    if (qIndex + 1 >= questions.length) {
      const stars = score >= 9 ? 3 : score >= 6 ? 2 : 1
      const isPerfect = score === questions.length
      const coinsEarned = isPerfect ? 15 : stars === 3 ? 10 : stars === 2 ? 6 : 3
      updateProgress({
        stars: progress.stars + stars,
        coins: progress.coins + coinsEarned,
        quizzesDone: progress.quizzesDone + 1,
        perfectQuizzes: isPerfect
          ? progress.perfectQuizzes + 1
          : progress.perfectQuizzes,
      })
      setDone(true)
    } else {
      setSelected(null)
      setCorrect(false)
      setQIndex(i => i + 1)
    }
  }

  const restart = () => {
    setQuestions(buildQuiz(words))
    setQIndex(0)
    setSelected(null)
    setCorrect(false)
    setScore(0)
    setDone(false)
    setDotStates(Array(10).fill(''))
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const emoji = pct === 100 ? '🌟' : pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'
    const msg =
      pct === 100 ? 'Perfect Score!' :
      pct >= 80   ? 'Brilliant!' :
      pct >= 50   ? 'Good effort!' :
                    'Keep practising!'
    const stars = score >= 9 ? 3 : score >= 6 ? 2 : 1
    const coinsEarned = pct === 100 ? 15 : stars === 3 ? 10 : stars === 2 ? 6 : 3

    return (
      <div className="quiz-result">
        <div className="result-emoji">{emoji}</div>
        <h2>{msg}</h2>
        <div className="result-score">{score}/{questions.length}</div>
        <div className="result-pct">{pct}% correct</div>
        <div className="stars-earned">
          {'⭐'.repeat(stars)}<br />+{stars} stars earned!
        </div>
        <div className="coins-earned">🪙 +{coinsEarned} coins earned!</div>
        <button className="quiz-next-btn" onClick={restart}>🔄 Try Again</button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="quiz-top">
        <h2>🧠 Quiz Time!</h2>
        <span className="quiz-score-chip">⭐ {score}</span>
      </div>

      {/* Progress dots */}
      <div className="quiz-progress-row">
        {dotStates.map((s, i) => (
          <div
            key={i}
            className={`quiz-dot ${s} ${i === qIndex && !s ? 'current' : ''}`}
          />
        ))}
      </div>

      {/* Question card */}
      <div className="quiz-card">
        <div className="quiz-q-num">Question {qIndex + 1} of {questions.length}</div>
        <div className="quiz-question">
          What does <span className="quiz-word-highlight">"{q.word.word}"</span> mean?
        </div>
      </div>

      {/* Options */}
      <div className="options-grid">
        {q.options.map(opt => {
          let cls = ''
          if (selected !== null) {
            if (opt.id === q.correctId) cls = 'correct'
            else if (opt.id === selected) cls = 'wrong'
          }
          return (
            <button
              key={opt.id}
              className={`option-btn ${cls}`}
              onClick={() => handleAnswer(opt)}
              disabled={selected !== null}
            >
              {opt.definition}
            </button>
          )
        })}
      </div>

      {/* Feedback + Next */}
      {selected !== null && (
        <>
          <div className={`quiz-feedback ${correct ? 'correct' : 'wrong'}`}>
            {correct
              ? '✅ Correct! Well done!'
              : `❌ Not quite — it means: "${q.word.definition}"`}
          </div>
          <button className="quiz-next-btn" onClick={handleNext}>
            {qIndex + 1 >= questions.length ? '🏁 See Results' : 'Next Question →'}
          </button>
        </>
      )}
    </div>
  )
}
