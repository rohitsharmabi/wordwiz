import type { Progress } from '../types'

type Props = {
  progress: Progress
}

export default function TopBar({ progress }: Props) {
  return (
    <header className="topbar">
      <div className="brand">📚 WordWiz</div>
      <div className="top-pills">
        <span className="pill">🔥 {progress.streak}</span>
        <span className="pill">⭐ {progress.stars}</span>
      </div>
    </header>
  )
}
