type Tab = 'home' | 'flashcard' | 'quiz' | 'challenge' | 'wordlist'

type Props = {
  tab: Tab
  setTab: (tab: Tab) => void
}

const NAV_ITEMS: Array<{ id: Tab; icon: string; label: string }> = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'flashcard', icon: '🃏', label: 'Cards' },
  { id: 'quiz', icon: '🧠', label: 'Quiz' },
  { id: 'challenge', icon: '🎤', label: 'Challenge' },
  { id: 'wordlist', icon: '📖', label: 'Words' },
]

export default function BottomNav({ tab, setTab }: Props) {
  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(item => (
        <button key={item.id} className={`nav-btn ${tab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>
          <div>{item.icon}</div>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  )
}
