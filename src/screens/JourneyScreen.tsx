import { useEffect, useMemo, useState } from 'react'
import JourneyPlayScreen from './JourneyPlayScreen'
import { ISLANDS } from '../constants/islands'
import type { Progress, Word } from '../types'

type Props = {
  words: Word[]
  progress: Progress
  updateProgress: (updates: Partial<Progress>) => void
}

type IslandState = 'locked' | 'unlocked' | 'progress' | 'complete'

function getIslandWords(words: Word[], category: string) {
  return words.filter(w => w.category === category)
}

function getIslandMastered(words: Word[], masteredIds: number[]) {
  return words.filter(w => masteredIds.includes(w.id))
}

export default function JourneyScreen({ words, progress, updateProgress }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [rewardedIsland, setRewardedIsland] = useState<string | null>(null)

  const islandData = useMemo(() => {
    return ISLANDS.map((island, index) => {
      const islandWords = getIslandWords(words, island.category)
      const masteredWords = getIslandMastered(islandWords, progress.masteredIds)
      const total = islandWords.length
      const mastered = masteredWords.length
      const pct = total ? mastered / total : 0

      let state: IslandState = 'locked'

      if (index === 0) {
        state = pct >= 0.8 ? 'complete' : pct > 0 ? 'progress' : 'unlocked'
      } else {
        const prev = ISLANDS[index - 1]
        const prevWords = getIslandWords(words, prev.category)
        const prevMastered = getIslandMastered(prevWords, progress.masteredIds)
        const prevPct = prevWords.length ? prevMastered.length / prevWords.length : 0

        if (prevPct >= 0.4) {
          state = pct >= 0.8 ? 'complete' : pct > 0 ? 'progress' : 'unlocked'
        } else {
          state = 'locked'
        }
      }

      const alreadyRewarded = progress.completedIslandIds.includes(island.id)

      return {
        ...island,
        total,
        mastered,
        pct,
        state,
        alreadyRewarded,
      }
    })
  }, [words, progress.masteredIds, progress.completedIslandIds])

  useEffect(() => {
    const newlyCompletedIsland = islandData.find(
      island => island.state === 'complete' && !island.alreadyRewarded
    )

    if (!newlyCompletedIsland) return

    updateProgress({
      stars: progress.stars + newlyCompletedIsland.rewardStars,
      earnedBadges: progress.earnedBadges.includes(newlyCompletedIsland.rewardBadgeId)
        ? progress.earnedBadges
        : [...progress.earnedBadges, newlyCompletedIsland.rewardBadgeId],
      completedIslandIds: [...progress.completedIslandIds, newlyCompletedIsland.id],
    })

    setRewardedIsland(newlyCompletedIsland.label)
  }, [islandData, progress, updateProgress])

  if (selectedCategory) {
    const categoryWords = words.filter(w => w.category === selectedCategory)

    return (
      <JourneyPlayScreen
        category={selectedCategory}
        words={categoryWords}
        progress={progress}
        updateProgress={updateProgress}
        onBack={() => setSelectedCategory(null)}
      />
    )
  }

  const completedCount = islandData.filter(i => i.state === 'complete').length
  const availableCount = islandData.filter(i => i.state !== 'locked').length

  return (
    <div>
      <div className="quiz-top">
        <h2>🗺️ Word Journey</h2>
        <span className="quiz-score-chip">{completedCount}/{islandData.length}</span>
      </div>

      <div className="journey-subtitle">
        Explore islands, answer questions, and build mastery one word at a time.
      </div>

      {rewardedIsland && (
        <div className="journey-reward-banner">
          🎉 Island complete! You unlocked rewards for <strong>{rewardedIsland}</strong>.
          <button
            className="journey-reward-close"
            onClick={() => setRewardedIsland(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="journey-overview-card">
        <div className="journey-overview-stat">
          <strong>{availableCount}</strong>
          <span>Open Islands</span>
        </div>
        <div className="journey-overview-stat">
          <strong>{completedCount}</strong>
          <span>Completed</span>
        </div>
        <div className="journey-overview-stat">
          <strong>{progress.mastered}</strong>
          <span>Mastered Words</span>
        </div>
      </div>

      <div className="journey-island-list">
        {islandData.map((island, index) => (
          <button
            key={island.id}
            className={`journey-island-card ${island.state}`}
            disabled={island.state === 'locked'}
            onClick={() => setSelectedCategory(island.category)}
          >
            <div className="journey-island-top">
              <div
                className={`journey-island-icon ${island.state}`}
                style={{ background: island.state === 'locked' ? '#d7d9e8' : island.color }}
              >
                {island.icon}
              </div>

              <div className="journey-island-meta">
                <div className="journey-island-name">{island.label}</div>
                <div className="journey-island-category">{island.category}</div>
              </div>

              <div className={`journey-island-state ${island.state}`}>
                {island.state === 'locked' && '🔒'}
                {island.state === 'unlocked' && '🌱'}
                {island.state === 'progress' && '⚡'}
                {island.state === 'complete' && '🌟'}
              </div>
            </div>

            <div className="journey-island-row">
              <span className="journey-island-status-text">
                {island.state === 'locked' && 'Locked'}
                {island.state === 'unlocked' && 'Ready to start'}
                {island.state === 'progress' && 'In progress'}
                {island.state === 'complete' && 'Completed'}
              </span>
              <span className="journey-island-count">
                {island.mastered}/{island.total}
              </span>
            </div>

            <div className="journey-island-progress">
              <div
                className="journey-island-progress-fill"
                style={{
                  width: `${Math.round(island.pct * 100)}%`,
                  background: island.state === 'locked' ? '#d7d9e8' : island.color,
                }}
              />
            </div>

            {island.state === 'complete' && (
              <div className="journey-island-reward-note">
                🎁 Reward: +{island.rewardStars} stars
              </div>
            )}

            {island.state === 'locked' && index > 0 && (
              <div className="journey-lock-note">
                Reach 40% in the previous island to unlock this one.
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
