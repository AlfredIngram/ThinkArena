import { Loader2 } from 'lucide-react'

/** Full-screen loading state shown while auth/session/profile data resolves. */
export function Splash({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="grid min-h-screen place-items-center tile-grid">
      <div className="flex flex-col items-center gap-3 text-white/70">
        <Loader2 className="animate-spin text-electric-cyan" size={36} aria-hidden />
        <p className="font-display text-lg">{label}</p>
      </div>
    </div>
  )
}
