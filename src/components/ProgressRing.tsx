interface ProgressRingProps {
  percent: number
  size?: number
  stroke?: number
  label?: string
  sublabel?: string
  color?: string
  trackColor?: string
}

/** Circular progress indicator used on mission cards and the parent dashboard. */
export function ProgressRing({
  percent,
  size = 96,
  stroke = 10,
  label,
  sublabel,
  color = '#22d3ee',
  trackColor = 'rgba(255,255,255,0.12)',
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          role="img"
          aria-label={`${label ?? 'Progress'}: ${clamped}%`}
        >
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 500ms ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-display text-2xl leading-none text-white">{clamped}%</p>
          {label && (
            <p className="mt-0.5 max-w-[80%] text-[10px] font-bold uppercase tracking-wide text-white/60">
              {label}
            </p>
          )}
        </div>
      </div>
      {sublabel && <p className="mt-1 text-xs text-white/60">{sublabel}</p>}
    </div>
  )
}
