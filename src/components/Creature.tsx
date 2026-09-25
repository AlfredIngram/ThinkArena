import { motion } from 'framer-motion'
import { useAnimations } from '../hooks/useAnimations'

export interface CreatureSpec {
  id: string
  name: string
  body: string
  accent: string
  horns: boolean
  antenna: boolean
  eyes: 1 | 2 | 3
  shape: 'blob' | 'tall' | 'wide'
}

/**
 * Original creature designs for the boss battles. Everything is drawn with
 * inline SVG shapes - no third-party artwork is used anywhere in the app.
 */
export const CREATURES: Record<string, CreatureSpec> = {
  glitchDragon: {
    id: 'glitchDragon',
    name: 'Zaxxor the Glitch Dragon',
    body: '#7c3aed',
    accent: '#22d3ee',
    horns: true,
    antenna: false,
    eyes: 2,
    shape: 'wide',
  },
  vowelGoblin: {
    id: 'vowelGoblin',
    name: 'Gribble the Vowel Goblin',
    body: '#16a34a',
    accent: '#a3e635',
    horns: true,
    antenna: false,
    eyes: 2,
    shape: 'blob',
  },
  numberCrusher: {
    id: 'numberCrusher',
    name: 'The Number Crusher',
    body: '#dc2626',
    accent: '#fbbf24',
    horns: false,
    antenna: true,
    eyes: 3,
    shape: 'tall',
  },
  voidBlob: {
    id: 'voidBlob',
    name: 'Void Blob',
    body: '#0891b2',
    accent: '#f472b6',
    horns: false,
    antenna: false,
    eyes: 1,
    shape: 'blob',
  },
}

interface CreatureProps {
  spec: CreatureSpec
  hpPercent: number
  size?: number
}

export function Creature({ spec, hpPercent, size = 180 }: CreatureProps) {
  const animate = useAnimations()
  const hurt = hpPercent < 35
  const defeated = hpPercent <= 0
  const bodyW = spec.shape === 'wide' ? 150 : spec.shape === 'tall' ? 104 : 128
  const bodyH = spec.shape === 'wide' ? 116 : spec.shape === 'tall' ? 150 : 124
  const cx = 100
  const cy = 110

  return (
    <motion.div
      className="flex flex-col items-center"
      animate={
        animate && !defeated
          ? { y: [0, -10, 0], rotate: [0, hpPercent < 50 ? 1.5 : 0.6, 0] }
          : undefined
      }
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        animate={defeated && animate ? { rotate: 92, y: 18, opacity: 0.35 } : undefined}
        transition={{ duration: 0.5 }}
        aria-label={spec.name}
        role="img"
      >
        {/* glow */}
        <ellipse cx={cx} cy={cy + 44} rx={bodyW * 0.55} ry={14} fill="rgba(0,0,0,0.35)" />

        {spec.antenna && (
          <>
            <line x1={cx} y1={cy - bodyH / 2} x2={cx} y2={cy - bodyH / 2 - 34} stroke={spec.accent} strokeWidth="6" strokeLinecap="round" />
            <circle cx={cx} cy={cy - bodyH / 2 - 40} r="10" fill={spec.accent} />
          </>
        )}

        {spec.horns && (
          <>
            <path
              d={`M ${cx - bodyW * 0.32} ${cy - bodyH * 0.42} L ${cx - bodyW * 0.5} ${cy - bodyH * 0.75} L ${cx - bodyW * 0.12} ${cy - bodyH * 0.5} Z`}
              fill={spec.accent}
            />
            <path
              d={`M ${cx + bodyW * 0.32} ${cy - bodyH * 0.42} L ${cx + bodyW * 0.5} ${cy - bodyH * 0.75} L ${cx + bodyW * 0.12} ${cy - bodyH * 0.5} Z`}
              fill={spec.accent}
            />
          </>
        )}

        <rect
          x={cx - bodyW / 2}
          y={cy - bodyH / 2}
          width={bodyW}
          height={bodyH}
          rx={spec.shape === 'blob' ? bodyH / 2 : 34}
          fill={spec.body}
        />
        <rect
          x={cx - bodyW / 2}
          y={cy - bodyH / 2}
          width={bodyW}
          height={bodyH}
          rx={spec.shape === 'blob' ? bodyH / 2 : 34}
          fill="url(#shine)"
          opacity="0.25"
        />

        {/* eyes */}
        {spec.eyes === 1 && (
          <g>
            <circle cx={cx} cy={cy - 12} r="20" fill="#fff" />
            <circle cx={cx} cy={cy - 12} r="9" fill="#0b1030" />
          </g>
        )}
        {spec.eyes === 2 && (
          <g>
            <circle cx={cx - 26} cy={cy - 14} r="16" fill="#fff" />
            <circle cx={cx + 26} cy={cy - 14} r="16" fill="#fff" />
            <circle cx={cx - 24} cy={cy - 12} r="7" fill="#0b1030" />
            <circle cx={cx + 28} cy={cy - 12} r="7" fill="#0b1030" />
          </g>
        )}
        {spec.eyes === 3 && (
          <g>
            <circle cx={cx - 30} cy={cy - 16} r="13" fill="#fff" />
            <circle cx={cx} cy={cy - 24} r="13" fill="#fff" />
            <circle cx={cx + 30} cy={cy - 16} r="13" fill="#fff" />
            <circle cx={cx - 30} cy={cy - 16} r="6" fill="#0b1030" />
            <circle cx={cx} cy={cy - 24} r="6" fill="#0b1030" />
            <circle cx={cx + 30} cy={cy - 16} r="6" fill="#0b1030" />
          </g>
        )}

        {/* mouth is a smile when healthy, a frown when nearly beaten */}
        <path
          d={hurt ? `M ${cx - 22} ${cy + 34} Q ${cx} ${cy + 16} ${cx + 22} ${cy + 34}` : `M ${cx - 22} ${cy + 22} Q ${cx} ${cy + 42} ${cx + 22} ${cy + 22}`}
          stroke="#0b1030"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        <defs>
          <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
      </motion.svg>
    </motion.div>
  )
}
