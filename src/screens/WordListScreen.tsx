import { useState } from 'react'
import type { Progress, Word } from '../types'

type Props = {
  words: Word[]
  progress: Progress
  updateProgress: (updates: Partial<Progress>) => void
}

export default function WordListScreen({ words, progress, updateProgress }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filters = ['all', 'mastered', 'tricky', 'review', ...new Set(words.map(w => w.category))]

  const filtered = words.filter(w => {
    const matchSearch =
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.definition.toLowerCase().includes(search.toLowerCase())

    const inReview = progress.reviewList.some(r => r.id === w.id)
    const inTricky = progress.trickyIds.includes(w.id)

    const matchFilter =
      filter === 'all' ||
      (filter === 'mastered' && progress.masteredIds.includes(w.id)) ||
      (filter === 'tricky' && inTricky) ||
      (filter === 'review' && inReview) ||
      w.category === filter

    return matchSearch && matchFilter
  })

  const toggleMaster = (id: number) => {
    const newIds = progress.masteredIds.includes(id)
      ? progress.masteredIds.filter(x => x !== id)
      : [...progress.masteredIds, id]

    updateProgress({ masteredIds: newIds, mastered: newIds.length })
  }

  const toggleTricky = (id: number) => {
    const newIds = progress.trickyIds.includes(id)
      ? progress.trickyIds.filter(x => x !== id)
      : [...progress.trickyIds, id]

    updateProgress({ trickyIds: newIds })
  }

  return (
    <div>
      <h2>Word Bank</h2>

      <input
        className="search-input"
        placeholder="Search words or definitions…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="filters">
        {filters.map(f => (
          <button key={f} className={`filter ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div className="stack">
        {filtered.map(w => {
          const inReview = progress.reviewList.some(r => r.id === w.id)
          const inTricky = progress.trickyIds.includes(w.id)

          return (
            <div key={w.id} className="list-card">
              <div>
                <div className="word-line">
                  <strong>{w.word}</strong> {inReview && '📅'} {inTricky && '🌶️'}
                </div>
                <div className="muted">{w.definition}</div>
                <small>{w.category} • {w.difficulty}</small>
              </div>

              <div className="icon-actions">
                <button onClick={() => toggleTricky(w.id)}>{inTricky ? '🌶️' : '🫑'}</button>
                <button onClick={() => toggleMaster(w.id)}>{progress.masteredIds.includes(w.id) ? '⭐' : '☆'}</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
