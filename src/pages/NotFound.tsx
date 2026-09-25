import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <span className="text-6xl" aria-hidden>
        🧭
      </span>
      <h1 className="font-display text-4xl text-white">This area isn’t on the map yet</h1>
      <p className="text-white/70">Head back to the lobby to pick your next quest.</p>
      <Link to="/" className="btn-primary">
        Back to Lobby
      </Link>
    </div>
  )
}
