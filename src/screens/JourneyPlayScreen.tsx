import { useMemo, useState } from 'react'
import type { Progress, Word } from '../types'

type Props = {
  category: string
  words: Word[]
  progress: Progress
  updateProgress: (updates: Partial<Progress>) => void
  onBack: () => void
}

type Phase =
  | 'meaning'
  | 'meaning-result'
  | 'sentence'
  | 'sentence-result'
  | 'learned'
  | 'synonym'
  | 'synonym-result'
  | 'antonym'
  | 'antonym-result'
  | 'mastered'
  | 'done'

type DotState = '' | 'done' | 'wrong'

type QuestionPack = {
  meaningOptions: string[]
  sentenceOptions: string[]
  synonymOptions: string[]
  antonymOptions: string[]
  displayedSynonymAnswer: string
  displayedAntonymAnswer: string
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function uniqueStrings(items: string[]) {
  return [...new Set(items.filter(Boolean))]
}

function addUnique(ids: number[], id: number) {
  return ids.includes(id) ? ids : [...ids, id]
}

function normalise(text: string) {
  return text.trim().toLowerCase()
}

function includesNormalised(list: string[], value: string) {
  const target = normalise(value)
  return list.some(item => normalise(item) === target)
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function uniqueWordList(words: Word[]) {
  const seen = new Set<number>()
  return words.filter(w => {
    if (seen.has(w.id)) return false
    seen.add(w.id)
    return true
  })
}

function pickDistractorWords(current: Word, pool: Word[], count = 3) {
  const sameDifficulty = pool.filter(
    w =>
      w.id !== current.id &&
      w.difficulty === current.difficulty &&
      w.category !== current.category
  )

  const sameCategory = pool.filter(
    w =>
      w.id !== current.id &&
      w.category === current.category
  )

  const fallback = pool.filter(w => w.id !== current.id)

  return uniqueWordList([
    ...shuffle(sameDifficulty),
    ...shuffle(sameCategory),
    ...shuffle(fallback),
  ]).slice(0, count)
}

function buildMeaningOptions(word: Word, pool: Word[]) {
  const distractors = pickDistractorWords(word, pool, 3)
    .map(w => w.definition)
    .filter(def => def !== word.definition)

  return shuffle(uniqueStrings([word.definition, ...distractors])).slice(0, 4)
}

function buildSentenceOptions(word: Word, pool: Word[]) {
  const distractors = pickDistractorWords(word, pool, 3)
    .map(w => w.example)
    .filter(example => example !== word.example)

  return shuffle(uniqueStrings([word.example, ...distractors])).slice(0, 4)
}

function ensureFourOptions(correct: string, options: string[], fallback: string[]) {
  const merged = uniqueStrings([correct, ...options, ...fallback])
  return merged.slice(0, 4)
}

function createQuestionPack(word: Word, pool: Word[]): QuestionPack {
  const displayedSynonymAnswer = pickOne(word.synonyms)
  const displayedAntonymAnswer = pickOne(word.antonyms)

  const meaningOptions = ensureFourOptions(
    word.definition,
    buildMeaningOptions(word, pool),
    pool.map(w => w.definition)
  )

  const sentenceOptions = ensureFourOptions(
    word.example,
    buildSentenceOptions(word, pool),
    pool.map(w => w.example)
  )

  const synonymDistractors = uniqueStrings(
    pickDistractorWords(word, pool, 6).flatMap(w => w.synonyms)
  ).filter(item => !includesNormalised(word.synonyms, item))

  const antonymDistractors = uniqueStrings(
    pickDistractorWords(word, pool, 6).flatMap(w => w.antonyms)
  ).filter(item => !includesNormalised(word.antonyms, item))

  const synonymOptions = shuffle(
    ensureFourOptions(
      displayedSynonymAnswer,
      synonymDistractors,
      pool.flatMap(w => w.synonyms)
    )
  )

  const antonymOptions = shuffle(
    ensureFourOptions(
      displayedAntonymAnswer,
      antonymDistractors,
      pool.flatMap(w => w.antonyms)
    )
  )

  return {
    meaningOptions: shuffle(meaningOptions),
    sentenceOptions: shuffle(sentenceOptions),
    synonymOptions,
    antonymOptions,
    displayedSynonymAnswer,
    displayedAntonymAnswer,
  }
}

export default function JourneyPlayScreen({
  category,
  words,
  progress,
  updateProgress,
  onBack,
}: Props) {
  const journeyLearnedIds =
    (progress as Progress & { journeyLearnedIds?: number[] }).journeyLearnedIds || []

  const sessionWords = useMemo(() => {
    const notMastered = words.filter(w => !progress.masteredIds.includes(w.id))
    const notLearned = notMastered.filter(w => !journeyLearnedIds.includes(w.id))

    if (notLearned.length) return shuffle(notLearned)
    if (notMastered.length) return shuffle(notMastered)
    return shuffle(words)
  }, [])

  const questionMap = useMemo(() => {
    const map: Record<number, QuestionPack> = {}
    sessionWords.forEach(word => {
      map[word.id] = createQuestionPack(word, words)
    })
    return map
  }, [sessionWords, words])

  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('meaning')
  const [meaningChoice, setMeaningChoice] = useState('')
  const [sentenceChoice, setSentenceChoice] = useState('')
  const [synonymChoice, setSynonymChoice] = useState('')
  const [antonymChoice, setAntonymChoice] = useState('')
  const [meaningCorrect, setMeaningCorrect] = useState(false)
  const [sentenceCorrect, setSentenceCorrect] = useState(false)
  const [synonymCorrect, setSynonymCorrect] = useState(false)
  const [antonymCorrect, setAntonymCorrect] = useState(false)
  const [learnedThisRun, setLearnedThisRun] = useState(0)
  const [masteredThisRun, setMasteredThisRun] = useState(0)
  const [dotStates, setDotStates] = useState<Record<number, DotState>>({})

  const currentWord = sessionWords[index]
  if (!currentWord) return null

  const questionPack = questionMap[currentWord.id]
  if (!questionPack) return null

  const setDotState = (wordId: number, state: DotState) => {
    setDotStates(prev => ({
      ...prev,
      [wordId]: state,
    }))
  }

  const resetWordState = () => {
    setPhase('meaning')
    setMeaningChoice('')
    setSentenceChoice('')
    setSynonymChoice('')
    setAntonymChoice('')
    setMeaningCorrect(false)
    setSentenceCorrect(false)
    setSynonymCorrect(false)
    setAntonymCorrect(false)
  }

  const nextWord = () => {
    if (index + 1 >= sessionWords.length) {
      setPhase('done')
    } else {
      setIndex(i => i + 1)
      resetWordState()
    }
  }

  const markLearned = () => {
    const nextLearned = addUnique(journeyLearnedIds, currentWord.id)
    updateProgress({
      journeyLearnedIds: nextLearned,
      stars: progress.stars + 2,
    } as Partial<Progress>)
    setLearnedThisRun(v => v + 1)
  }

  const markMastered = () => {
    const nextMastered = addUnique(progress.masteredIds, currentWord.id)
    const nextLearned = addUnique(journeyLearnedIds, currentWord.id)

    updateProgress({
      masteredIds: nextMastered,
      mastered: nextMastered.length,
      journeyLearnedIds: nextLearned,
      stars: progress.stars + 2,
    } as Partial<Progress>)
    setMasteredThisRun(v => v + 1)
  }

  if (phase === 'done') {
    return (
      <div className="quiz-result">
        <div className="result-emoji">🏝️</div>
        <h2>Island Complete!</h2>
        <div className="result-score">{masteredThisRun}</div>
        <div className="result-pct">words mastered this run</div>
        <div className="stars-earned">
          ✅ Learned: {learnedThisRun}
          <br />
          🌟 Mastered: {masteredThisRun}
        </div>
        <button className="quiz-next-btn" onClick={onBack}>
          ← Back to Journey
        </button>
      </div>
    )
  }

  return (
    <div>
      <button className="journey-back-link" onClick={onBack}>
        ← Back to Journey
      </button>

      <div className="quiz-top">
        <h2>🗺️ Journey Mode</h2>
        <span className="quiz-score-chip">
          {index + 1}/{sessionWords.length}
        </span>
      </div>

      <div className="journey-subtitle">
        {category} · Learn the word, then unlock mastery
      </div>

      <div className="quiz-progress-row">
        {sessionWords.map((word, i) => (
          <div
            key={word.id}
            className={`quiz-dot ${dotStates[word.id] || ''} ${i === index && !dotStates[word.id] ? 'current' : ''}`}
          />
        ))}
      </div>

      {(phase === 'meaning' || phase === 'meaning-result') && (
        <>
          <div className="quiz-card">
            <div className="quiz-q-num">Word {index + 1} of {sessionWords.length}</div>
            <div className="quiz-question">
              What does <span className="quiz-word-highlight">"{currentWord.word}"</span> mean?
            </div>
          </div>

          <div className="options-grid">
            {questionPack.meaningOptions.map(option => {
              let cls = ''
              if (phase === 'meaning-result') {
                if (option === currentWord.definition) cls = 'correct'
                else if (option === meaningChoice) cls = 'wrong'
              }

              return (
                <button
                  key={option}
                  className={`option-btn ${cls}`}
                  disabled={phase !== 'meaning'}
                  onClick={() => {
                    if (phase !== 'meaning') return
                    setMeaningChoice(option)
                    setMeaningCorrect(option === currentWord.definition)
                    setPhase('meaning-result')
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {phase === 'meaning-result' && (
            <>
              <div className={`quiz-feedback ${meaningCorrect ? 'correct' : 'wrong'}`}>
                {meaningCorrect
                  ? '✅ Correct! Well done!'
                  : `❌ Not quite — it means: "${currentWord.definition}"`}
              </div>
              <button
                className="quiz-next-btn"
                onClick={() => {
                  if (meaningCorrect) {
                    setPhase('sentence')
                  } else {
                    updateProgress({
                      trickyIds: addUnique(progress.trickyIds, currentWord.id),
                    })
                    setDotState(currentWord.id, 'wrong')
                    nextWord()
                  }
                }}
              >
                {meaningCorrect ? 'Continue →' : 'Next Word →'}
              </button>
            </>
          )}
        </>
      )}

      {(phase === 'sentence' || phase === 'sentence-result') && (
        <>
          <div className="quiz-card">
            <div className="quiz-q-num">Sentence check</div>
            <div className="quiz-question">
              Which sentence best shows the meaning of <span className="quiz-word-highlight">"{currentWord.word}"</span>?
            </div>
          </div>

          <div className="options-grid">
            {questionPack.sentenceOptions.map(option => {
              let cls = ''
              if (phase === 'sentence-result') {
                if (option === currentWord.example) cls = 'correct'
                else if (option === sentenceChoice) cls = 'wrong'
              }

              return (
                <button
                  key={option}
                  className={`option-btn ${cls}`}
                  disabled={phase !== 'sentence'}
                  onClick={() => {
                    if (phase !== 'sentence') return
                    setSentenceChoice(option)
                    setSentenceCorrect(option === currentWord.example)
                    setPhase('sentence-result')
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {phase === 'sentence-result' && (
            <>
              <div className={`quiz-feedback ${sentenceCorrect ? 'correct' : 'wrong'}`}>
                {sentenceCorrect
                  ? '✅ Great sentence choice!'
                  : `❌ Not quite — best answer: "${currentWord.example}"`}
              </div>
              <button
                className="quiz-next-btn"
                onClick={() => {
                  if (sentenceCorrect) {
                    if (!journeyLearnedIds.includes(currentWord.id)) {
                      markLearned()
                    }
                    setPhase('learned')
                  } else {
                    updateProgress({
                      stars: progress.stars + 1,
                      trickyIds: addUnique(progress.trickyIds, currentWord.id),
                    })
                    setDotState(currentWord.id, 'wrong')
                    nextWord()
                  }
                }}
              >
                Continue →
              </button>
            </>
          )}
        </>
      )}

      {phase === 'learned' && (
        <>
          <div className="quiz-feedback correct">
            ✅ Learned! You got the meaning and sentence right.
          </div>

          {progress.masteredIds.includes(currentWord.id) ? (
            <button
              className="quiz-next-btn"
              onClick={() => {
                setDotState(currentWord.id, 'done')
                nextWord()
              }}
            >
              Next Word →
            </button>
          ) : (
            <div className="journey-action-stack">
              <button className="quiz-next-btn" onClick={() => setPhase('synonym')}>
                Bonus Round →
              </button>
              <button
                className="journey-secondary-btn"
                onClick={() => {
                  setDotState(currentWord.id, 'done')
                  nextWord()
                }}
              >
                Skip Bonus for Now
              </button>
            </div>
          )}
        </>
      )}

      {(phase === 'synonym' || phase === 'synonym-result') && (
        <>
          <div className="quiz-card">
            <div className="quiz-q-num">Bonus mastery</div>
            <div className="quiz-question">
              Which is the best synonym for <span className="quiz-word-highlight">"{currentWord.word}"</span>?
            </div>
          </div>

          <div className="options-grid">
            {questionPack.synonymOptions.map(option => {
              let cls = ''
              if (phase === 'synonym-result') {
                if (normalise(option) === normalise(questionPack.displayedSynonymAnswer)) cls = 'correct'
                else if (option === synonymChoice) cls = 'wrong'
              }

              return (
                <button
                  key={option}
                  className={`option-btn ${cls}`}
                  disabled={phase !== 'synonym'}
                  onClick={() => {
                    if (phase !== 'synonym') return
                    setSynonymChoice(option)
                    setSynonymCorrect(includesNormalised(currentWord.synonyms, option))
                    setPhase('synonym-result')
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {phase === 'synonym-result' && (
            <>
              <div className={`quiz-feedback ${synonymCorrect ? 'correct' : 'wrong'}`}>
                {synonymCorrect
                  ? '✅ Nice! That is a valid synonym.'
                  : `❌ Not quite — good synonyms include: ${currentWord.synonyms.join(', ')}`}
              </div>
              <button className="quiz-next-btn" onClick={() => setPhase('antonym')}>
                Continue →
              </button>
            </>
          )}
        </>
      )}

      {(phase === 'antonym' || phase === 'antonym-result') && (
        <>
          <div className="quiz-card">
            <div className="quiz-q-num">Final mastery check</div>
            <div className="quiz-question">
              Which is the best antonym for <span className="quiz-word-highlight">"{currentWord.word}"</span>?
            </div>
          </div>

          <div className="options-grid">
            {questionPack.antonymOptions.map(option => {
              let cls = ''
              if (phase === 'antonym-result') {
                if (normalise(option) === normalise(questionPack.displayedAntonymAnswer)) cls = 'correct'
                else if (option === antonymChoice) cls = 'wrong'
              }

              return (
                <button
                  key={option}
                  className={`option-btn ${cls}`}
                  disabled={phase !== 'antonym'}
                  onClick={() => {
                    if (phase !== 'antonym') return
                    setAntonymChoice(option)
                    setAntonymCorrect(includesNormalised(currentWord.antonyms, option))
                    setPhase('antonym-result')
                  }}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {phase === 'antonym-result' && (
            <>
              <div className={`quiz-feedback ${antonymCorrect ? 'correct' : 'wrong'}`}>
                {antonymCorrect
                  ? '✅ Excellent! That is a valid antonym.'
                  : `❌ Not quite — good antonyms include: ${currentWord.antonyms.join(', ')}`}
              </div>
              <button
                className="quiz-next-btn"
                onClick={() => {
                  if (synonymCorrect && antonymCorrect) {
                    if (!progress.masteredIds.includes(currentWord.id)) {
                      markMastered()
                    }
                    setPhase('mastered')
                  } else {
                    updateProgress({
                      trickyIds: addUnique(progress.trickyIds, currentWord.id),
                    })
                    setDotState(currentWord.id, 'done')
                    nextWord()
                  }
                }}
              >
                Continue →
              </button>
            </>
          )}
        </>
      )}

      {phase === 'mastered' && (
        <>
          <div className="quiz-feedback correct">
            🌟 Mastered! You got the synonym and antonym right too.
          </div>
          <button
            className="quiz-next-btn"
            onClick={() => {
              setDotState(currentWord.id, 'done')
              nextWord()
            }}
          >
            Next Word →
          </button>
        </>
      )}
    </div>
  )
}