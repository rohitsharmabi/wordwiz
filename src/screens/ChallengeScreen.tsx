import { useState } from 'react'
import SpeechInput from '../components/SpeechInput'
import type { Progress, Word } from '../types'
import { evaluateMeaning, evaluateSentence, type EvaluationResult } from '../utils/evaluation'
import { speak } from '../utils/speech'

type Props = {
  words: Word[]
  progress: Progress
  updateProgress: (updates: Partial<Progress>) => void
}

export default function ChallengeScreen({ words, progress, updateProgress }: Props) {
  const [step, setStep] = useState<'ready' | 'word' | 'know' | 'answer' | 'teach' | 'sentence' | 'summary'>('ready')
  const [word, setWord] = useState<Word | null>(null)
  const [meaningText, setMeaningText] = useState('')
  const [sentenceText, setSentenceText] = useState('')
  const [meaningEval, setMeaningEval] = useState<EvaluationResult | null>(null)
  const [sentenceEval, setSentenceEval] = useState<EvaluationResult | null>(null)

  const pickWord = (): Word => {
    const trickyPool = (progress.trickyIds || [])
      .map(id => words.find(w => w.id === id))
      .filter((w): w is Word => Boolean(w))

    if (trickyPool.length) {
      return trickyPool[Math.floor(Math.random() * trickyPool.length)]
    }

    return words[Math.floor(Math.random() * words.length)]
  }

  const start = () => {
    const nextWord = pickWord()
    setWord(nextWord)
    setMeaningText('')
    setSentenceText('')
    setMeaningEval(null)
    setSentenceEval(null)
    setStep('word')
  }

  if (step === 'ready') {
    return (
      <div className="center-block">
        <h2>Ready for your next word?</h2>
        <button className="primary-btn" onClick={start}>Yes, let's go</button>
      </div>
    )
  }

  if (!word) return null

  if (step === 'word') {
    return (
      <div>
        <div className="hero-card">
          <div className="label">Your word is</div>
          <h1>{word.word}</h1>
          <button className="small-btn" onClick={() => speak(word.word)}>🔊 Hear word</button>
        </div>
        <button className="primary-btn" onClick={() => setStep('know')}>Continue</button>
      </div>
    )
  }

  if (step === 'know') {
    return (
      <div className="stack">
        <h2>Do you know what "{word.word}" means?</h2>
        <button className="primary-btn" onClick={() => setStep('answer')}>Yes, I know it</button>
        <button className="secondary-btn" onClick={() => setStep('teach')}>Not sure / No</button>
      </div>
    )
  }

  if (step === 'answer') {
    return (
      <div className="stack">
        <h2>What does "{word.word}" mean?</h2>
        <SpeechInput value={meaningText} onChange={setMeaningText} placeholder="Type or speak your answer" />
        <button
          className="primary-btn"
          onClick={() => {
            setMeaningEval(evaluateMeaning(meaningText, word))
            setStep('sentence')
          }}
        >
          Submit
        </button>
      </div>
    )
  }

  if (step === 'teach') {
    return (
      <div className="stack">
        <div className="hero-card green">
          <h2>{word.word}</h2>
          <p>{word.definition}</p>
          <p className="example">"{word.example}"</p>
          <button className="small-btn" onClick={() => speak(`${word.word}. ${word.definition}. Example. ${word.example}`)}>
            🔊 Hear definition
          </button>
        </div>
        <button className="primary-btn" onClick={() => setStep('sentence')}>
          I'm ready to write a sentence
        </button>
      </div>
    )
  }

  if (step === 'sentence') {
    return (
      <div className="stack">
        {meaningEval && <div className={`feedback ${meaningEval.grade}`}>{meaningEval.feedback}</div>}
        <h2>Use "{word.word}" in a sentence</h2>
        <SpeechInput value={sentenceText} onChange={setSentenceText} placeholder="Write or speak a sentence" />
        <button
          className="primary-btn"
          onClick={() => {
            const sEval = evaluateSentence(sentenceText, word)
            setSentenceEval(sEval)

            const combined = (meaningEval?.score || 0) + sEval.score
            const markKnown = combined >= 5

            const newMasteredIds =
              markKnown && !progress.masteredIds.includes(word.id)
                ? [...progress.masteredIds, word.id]
                : progress.masteredIds

            let newReview = progress.reviewList.filter(r => r.id !== word.id)
            if (!markKnown) {
              newReview = [
                ...newReview,
                {
                  id: word.id,
                  reviewAfter: new Date(Date.now() + 2 * 86400000).toISOString(),
                },
              ]
            }

            const coinsEarned = markKnown ? 6 : 3
            updateProgress({
              challengesDone: progress.challengesDone + 1,
              stars: progress.stars + Math.max(1, Math.min(combined, 5)),
              coins: progress.coins + coinsEarned,
              masteredIds: newMasteredIds,
              mastered: newMasteredIds.length,
              reviewList: newReview,
            })

            setStep('summary')
          }}
        >
          Submit sentence
        </button>
      </div>
    )
  }

  return (
    <div className="stack">
      {sentenceEval && <div className={`feedback ${sentenceEval.grade}`}>{sentenceEval.feedback}</div>}
      <div className="hero-card green">
        <h2>{word.word}</h2>
        <p>{word.definition}</p>
        <div><strong>Synonyms:</strong> {(word.synonyms || []).join(', ')}</div>
        <div><strong>Antonyms:</strong> {(word.antonyms || []).join(', ')}</div>
        <button
          className="small-btn"
          onClick={() =>
            speak(`Synonyms for ${word.word}: ${(word.synonyms || []).join(', ')}. Antonyms: ${(word.antonyms || []).join(', ')}`)
          }
        >
          🔊 Hear synonyms & antonyms
        </button>
      </div>
      <button className="primary-btn" onClick={() => setStep('ready')}>Done! Next word</button>
    </div>
  )
}
