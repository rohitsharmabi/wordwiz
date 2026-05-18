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
    options: shuffle([word, ...shuffle(words.filter(w => w.id !== word.id)).slice(0, 3)]),
  }))
}

export default function QuizScreen({ words, progress, updateProgress }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => buildQuiz(words))
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[qIndex]

  const answer = (opt: Word) => {
    if (selected !== null) return
    setSelected(opt.id)
    if (opt.id === q.correctId) setScore(s => s + 1)
  }

  const next = () => {
    if (qIndex + 1 >= questions.length) {
      updateProgress({
        quizzesDone: progress.quizzesDone + 1,
        stars: progress.stars + (score >= 6 ? 2 : 1),
      })
      setDone(true)
    } else {
      setSelected(null)
      setQIndex(i => i + 1)
    }
  }

  if (done) {
    return (
      <div className="center-block">
        <h2>Quiz Complete</h2>
        <div className="big-score">{score} / {questions.length}</div>
        <button
          className="primary-btn"
          onClick={() => {
            setQuestions(buildQuiz(words))
            setQIndex(0)
            setSelected(null)
            setScore(0)
            setDone(false)
          }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="row-between">
        <h2>Quiz</h2>
        <span className="pill">⭐ {score}</span>
      </div>

      <div className="quiz-card">
        <div className="muted">Question {qIndex + 1} of {questions.length}</div>
        <h3>What does "{q.word.word}" mean?</h3>
      </div>

      <div className="stack">
        {q.options.map(opt => {
          let cls = 'option-btn'
          if (selected !== null) {
            if (opt.id === q.correctId) cls += ' correct'
            else if (opt.id === selected) cls += ' wrong'
          }

          return (
            <button key={opt.id} className={cls} onClick={() => answer(opt)} disabled={selected !== null}>
              {opt.definition}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <button className="primary-btn" onClick={next}>
          {qIndex + 1 >= questions.length ? 'See Results' : 'Next'}
        </button>
      )}
    </div>
  )
}
