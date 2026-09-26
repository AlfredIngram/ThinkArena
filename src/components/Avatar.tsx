import type { WardrobeEquip } from '../types'
import { wardrobeById } from '../data/wardrobe'

/**
 * Layered, code-drawn avatar renderer.
 *
 * Draw order (back to front): aura -> body -> ears -> head -> face ->
 * hair/hat -> outfit -> accessory -> companion.
 *
 * Every layer is a plain SVG shape, so the whole "skin" system is just data.
 * If an item defines `image`, that raster file (drop it in `public/avatars/`)
 * is drawn instead of the code art.
 */

interface AvatarProps {
  equip: WardrobeEquip
  size?: number
  /** Skip the ground shadow + aura for tiny inline uses. */
  simple?: boolean
  className?: string
  label?: string
}

function art(equip: WardrobeEquip, slot: keyof WardrobeEquip): Record<string, string | number | boolean> {
  return wardrobeById(equip[slot])?.art ?? {}
}

const s = (v: unknown, fallback = ''): string => (v === undefined ? fallback : String(v))
const n = (v: unknown, fallback: number): number => (typeof v === 'number' ? v : fallback)

export function Avatar({ equip, size = 160, simple = false, className = '', label }: AvatarProps) {
  const imageItem = wardrobeById(equip.base)

  // If the body slot ships raster art, prefer it (images win over code art).
  if (imageItem?.image) {
    return (
      <img
        src={imageItem.image}
        width={size}
        height={size}
        alt={label ?? imageItem.name}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  const base = art(equip, 'base')
  const skin = art(equip, 'skin')
  const hair = art(equip, 'hair')
  const outfit = art(equip, 'outfit')
  const accessory = art(equip, 'accessory')
  const pet = art(equip, 'pet')
  const aura = art(equip, 'aura')

  const cx = 100
  const headR = n(base.head, 46)
  const headCy = 84
  const bodyW = n(base.bodyW, 84)
  const bodyH = n(base.bodyH, 74)
  const bodyTop = headCy + headR * 0.5
  const bodyCy = bodyTop + bodyH / 2

  const bodyColor = s(skin.body, '#ffd7b5')
  const blush = s(skin.blush, '#ff9db1')
  const outline = 'rgba(20,16,48,0.55)'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={label ?? 'Avatar'}
    >
      <defs>
        <radialGradient id="av-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="av-shine" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {!simple && <AuraLayer style={s(aura.style, 'none')} color={s(aura.color, '#fef08a')} cx={cx} bodyCy={bodyCy} />}

      {/* ground shadow */}
      <ellipse cx={cx} cy={bodyTop + bodyH + 12} rx={bodyW * 0.52} ry={9} fill="rgba(0,0,0,0.3)" />

      {/* ears behind head */}
      <EarsLayer style={s(base.ears, 'none')} cx={cx} headCy={headCy} headR={headR} color={bodyColor} outline={outline} />

      {/* body */}
      <g>
        <rect
          x={cx - bodyW / 2}
          y={bodyTop}
          width={bodyW}
          height={bodyH}
          rx={bodyH * 0.42}
          fill={bodyColor}
          stroke={outline}
          strokeWidth="2"
        />
        {/* little arms */}
        <circle cx={cx - bodyW / 2 - 2} cy={bodyTop + bodyH * 0.45} r={9} fill={bodyColor} stroke={outline} strokeWidth="2" />
        <circle cx={cx + bodyW / 2 + 2} cy={bodyTop + bodyH * 0.45} r={9} fill={bodyColor} stroke={outline} strokeWidth="2" />
        <rect
          x={cx - bodyW / 2}
          y={bodyTop}
          width={bodyW}
          height={bodyH}
          rx={bodyH * 0.42}
          fill="url(#av-shine)"
        />
      </g>

      {/* head */}
      <circle cx={cx} cy={headCy} r={headR} fill={bodyColor} stroke={outline} strokeWidth="2" />
      <circle cx={cx - headR * 0.4} cy={headCy - headR * 0.45} r={headR * 0.42} fill="url(#av-glow)" />

      {/* face */}
      <FaceLayer cx={cx} headCy={headCy} blush={blush} />

      {/* hair / hats */}
      <HairLayer style={s(hair.style, 'tuft')} color={s(hair.color, '#8a5a3b')} cx={cx} headCy={headCy} headR={headR} outline={outline} />

      {/* outfits drawn over the body, under accessories */}
      <OutfitLayer
        style={s(outfit.style, 'tee')}
        color={s(outfit.color, '#38bdf8')}
        accent={s(outfit.accent, '#0ea5e9')}
        cx={cx}
        bodyTop={bodyTop}
        bodyW={bodyW}
        bodyH={bodyH}
        outline={outline}
      />

      {/* accessories */}
      <AccessoryLayer
        style={s(accessory.style, 'none')}
        color={s(accessory.color, '#334155')}
        cx={cx}
        headCy={headCy}
        headR={headR}
      />

      {/* companion */}
      <PetLayer style={s(pet.style, 'none')} color={s(pet.color, '#5eead4')} outline={outline} />
    </svg>
  )
}

/* ------------------------------------------------------------------ face */

function FaceLayer({ cx, headCy, blush }: { cx: number; headCy: number; blush: string }) {
  const eyeY = headCy - 4
  const eyeDx = 17
  return (
    <g>
      {[-1, 1].map((dir) => (
        <g key={dir}>
          <ellipse cx={cx + dir * eyeDx} cy={eyeY} rx={13} ry={15} fill="#ffffff" stroke="rgba(20,16,48,0.25)" strokeWidth="1.5" />
          <circle cx={cx + dir * eyeDx + dir * 1.5} cy={eyeY + 2} r={8} fill="#241a3d" />
          <circle cx={cx + dir * eyeDx + dir * 1.5 + 2} cy={eyeY - 1} r={2.6} fill="#ffffff" />
          <circle cx={cx + dir * eyeDx - dir * 2} cy={eyeY + 5} r={1.6} fill="#ffffff" opacity="0.8" />
        </g>
      ))}
      {/* blush */}
      <ellipse cx={cx - 30} cy={headCy + 12} rx={8} ry={5} fill={blush} opacity="0.55" />
      <ellipse cx={cx + 30} cy={headCy + 12} rx={8} ry={5} fill={blush} opacity="0.55" />
      {/* smile */}
      <path
        d={`M ${cx - 11} ${headCy + 14} Q ${cx} ${headCy + 25} ${cx + 11} ${headCy + 14}`}
        stroke="#241a3d"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  )
}

/* ------------------------------------------------------------------ ears */

function EarsLayer({
  style,
  cx,
  headCy,
  headR,
  color,
  outline,
}: {
  style: string
  cx: number
  headCy: number
  headR: number
  color: string
  outline: string
}) {
  const top = headCy - headR
  if (style === 'cat') {
    return (
      <g>
        {[-1, 1].map((dir) => (
          <path
            key={dir}
            d={`M ${cx + dir * 22} ${top + 14} L ${cx + dir * 40} ${top - 20} L ${cx + dir * 46} ${top + 16} Z`}
            fill={color}
            stroke={outline}
            strokeWidth="2"
          />
        ))}
      </g>
    )
  }
  if (style === 'bunny') {
    return (
      <g>
        {[-1, 1].map((dir) => (
          <ellipse
            key={dir}
            cx={cx + dir * 24}
            cy={top - 18}
            rx={10}
            ry={30}
            fill={color}
            stroke={outline}
            strokeWidth="2"
            transform={`rotate(${dir * 8} ${cx + dir * 24} ${top - 18})`}
          />
        ))}
      </g>
    )
  }
  if (style === 'horn') {
    return (
      <g>
        {[-1, 1].map((dir) => (
          <path
            key={dir}
            d={`M ${cx + dir * 24} ${top + 10} L ${cx + dir * 34} ${top - 22} L ${cx + dir * 44} ${top + 14} Z`}
            fill="#fde68a"
            stroke={outline}
            strokeWidth="2"
          />
        ))}
      </g>
    )
  }
  return null
}

/* ------------------------------------------------------------------ hair */

function HairLayer({
  style,
  color,
  cx,
  headCy,
  headR,
  outline,
}: {
  style: string
  color: string
  cx: number
  headCy: number
  headR: number
  outline: string
}) {
  const top = headCy - headR
  const cap = `M ${cx - headR} ${headCy - 6} A ${headR} ${headR} 0 0 1 ${cx + headR} ${headCy - 6} L ${cx + headR - 6} ${headCy - 14} Q ${cx} ${top - 6} ${cx - headR + 6} ${headCy - 14} Z`
  switch (style) {
    case 'tuft':
      return (
        <path
          d={`M ${cx - 10} ${top + 6} Q ${cx} ${top - 20} ${cx + 8} ${top + 2} Q ${cx + 2} ${top - 2} ${cx - 10} ${top + 6} Z`}
          fill={color}
          stroke={outline}
          strokeWidth="1.5"
        />
      )
    case 'bob':
      return <path d={cap} fill={color} stroke={outline} strokeWidth="2" />
    case 'ponytail':
      return (
        <g>
          <path d={cap} fill={color} stroke={outline} strokeWidth="2" />
          <ellipse cx={cx + headR + 8} cy={headCy + 6} rx={13} ry={26} fill={color} stroke={outline} strokeWidth="2" transform={`rotate(18 ${cx + headR + 8} ${headCy + 6})`} />
        </g>
      )
    case 'curls':
      return (
        <g>
          <path d={cap} fill={color} stroke={outline} strokeWidth="2" />
          {[-30, -12, 8, 26].map((dx) => (
            <circle key={dx} cx={cx + dx} cy={top + 6} r={12} fill={color} stroke={outline} strokeWidth="1.5" />
          ))}
        </g>
      )
    case 'spiky':
      return (
        <g>
          <path d={cap} fill={color} stroke={outline} strokeWidth="2" />
          {[-26, -8, 10, 28].map((dx) => (
            <path key={dx} d={`M ${cx + dx - 8} ${top + 8} L ${cx + dx} ${top - 22} L ${cx + dx + 8} ${top + 8} Z`} fill={color} stroke={outline} strokeWidth="1.5" />
          ))}
        </g>
      )
    case 'beanie':
      return (
        <g>
          <path d={cap} fill={color} stroke={outline} strokeWidth="2" />
          <rect x={cx - headR - 2} y={headCy - 24} width={(headR + 2) * 2} height="12" rx="6" fill={color} stroke={outline} strokeWidth="2" />
          <circle cx={cx} cy={top - 10} r={9} fill="#ffffff" stroke={outline} strokeWidth="2" />
        </g>
      )
    case 'wizard':
      return (
        <g>
          <path d={`M ${cx - 30} ${headCy - 22} L ${cx} ${top - 54} L ${cx + 30} ${headCy - 22} Z`} fill={color} stroke={outline} strokeWidth="2" />
          <ellipse cx={cx} cy={headCy - 22} rx={44} ry={10} fill={color} stroke={outline} strokeWidth="2" />
          <path d={`M ${cx - 6} ${top - 30} l 4 4 l 6 -8`} stroke="#fde68a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      )
    case 'crown':
      return (
        <g>
          <path
            d={`M ${cx - 30} ${headCy - 22} L ${cx - 30} ${top + 2} L ${cx - 15} ${top + 12} L ${cx} ${top - 8} L ${cx + 15} ${top + 12} L ${cx + 30} ${top + 2} L ${cx + 30} ${headCy - 22} Z`}
            fill={color}
            stroke={outline}
            strokeWidth="2"
          />
          <circle cx={cx} cy={top + 2} r={3.5} fill="#f472b6" />
          <circle cx={cx - 20} cy={top + 8} r={2.6} fill="#22d3ee" />
          <circle cx={cx + 20} cy={top + 8} r={2.6} fill="#22d3ee" />
        </g>
      )
    default:
      return null
  }
}

/* ---------------------------------------------------------------- outfit */

function OutfitLayer({
  style,
  color,
  accent,
  cx,
  bodyTop,
  bodyW,
  bodyH,
  outline,
}: {
  style: string
  color: string
  accent: string
  cx: number
  bodyTop: number
  bodyW: number
  bodyH: number
  outline: string
}) {
  const w = bodyW - 6
  const x = cx - w / 2
  const y = bodyTop + bodyH * 0.28
  const h = bodyH * 0.72
  switch (style) {
    case 'none':
      return null
    case 'tee':
      return (
        <g>
          <rect x={x} y={y} width={w} height={h} rx={12} fill={color} stroke={outline} strokeWidth="2" />
          <path d={`M ${cx - 14} ${y} Q ${cx} ${y + 12} ${cx + 14} ${y} L ${cx + 10} ${y - 3} L ${cx - 10} ${y - 3} Z`} fill={accent} opacity="0.85" />
        </g>
      )
    case 'hoodie':
      return (
        <g>
          <path d={`M ${cx - w / 2} ${y + 6} Q ${cx} ${y - 12} ${cx + w / 2} ${y + 6} L ${cx + w / 2} ${y - 6} Q ${cx} ${y - 26} ${cx - w / 2} ${y - 6} Z`} fill={accent} stroke={outline} strokeWidth="2" />
          <rect x={x} y={y} width={w} height={h} rx={12} fill={color} stroke={outline} strokeWidth="2" />
          <path d={`M ${cx - 16} ${y + 18} L ${cx + 16} ${y + 18} L ${cx + 12} ${y + 34} L ${cx - 12} ${y + 34} Z`} fill={accent} opacity="0.6" />
        </g>
      )
    case 'dress':
      return (
        <path d={`M ${cx - 14} ${y} L ${cx + 14} ${y} L ${cx + w / 2 + 6} ${y + h} L ${cx - w / 2 - 6} ${y + h} Z`} fill={color} stroke={outline} strokeWidth="2" />
      )
    case 'lab':
      return (
        <g>
          <rect x={x} y={y} width={w} height={h} rx={10} fill={color} stroke={outline} strokeWidth="2" />
          <path d={`M ${cx - 16} ${y} L ${cx} ${y + 14} L ${cx + 16} ${y} L ${cx + 10} ${y - 4} L ${cx - 10} ${y - 4} Z`} fill={accent} />
          <rect x={cx + w / 2 - 22} y={y + h - 22} width="16" height="12" rx="3" fill={accent} opacity="0.7" />
        </g>
      )
    case 'suit':
      return (
        <g>
          <rect x={x} y={y} width={w} height={h} rx={10} fill={color} stroke={outline} strokeWidth="2" />
          <path d={`M ${cx - 12} ${y} L ${cx} ${y + 12} L ${cx + 12} ${y} Z`} fill="#ffffff" opacity="0.9" />
          <path d={`M ${cx - 5} ${y + 12} L ${cx + 5} ${y + 12} L ${cx + 2} ${y + 34} L ${cx - 2} ${y + 34} Z`} fill={accent} />
        </g>
      )
    case 'cape':
      return (
        <g>
          <path d={`M ${cx - w / 2 - 10} ${y + 4} Q ${cx - w / 2 - 20} ${y + h + 12} ${cx - w / 2 + 6} ${y + h + 6} L ${cx - w / 2 + 6} ${y + 4} Z`} fill={accent} opacity="0.85" />
          <path d={`M ${cx + w / 2 + 10} ${y + 4} Q ${cx + w / 2 + 20} ${y + h + 12} ${cx + w / 2 - 6} ${y + h + 6} L ${cx + w / 2 - 6} ${y + 4} Z`} fill={accent} opacity="0.85" />
          <rect x={x} y={y} width={w} height={h} rx={10} fill={color} stroke={outline} strokeWidth="2" />
          <path d={`M ${cx - w / 2 + 6} ${y + 4} L ${cx - 4} ${y + 30} L ${cx} ${y} Z`} fill={accent} opacity="0.6" />
        </g>
      )
    case 'armor':
      return (
        <g>
          <rect x={x} y={y} width={w} height={h} rx={10} fill={color} stroke={outline} strokeWidth="2" />
          <circle cx={cx} cy={y + 20} r={9} fill={accent} stroke={outline} strokeWidth="1.5" />
          <path d={`M ${cx - w / 2 + 8} ${y + 30} L ${cx - w / 2 + 8} ${y + h - 8}`} stroke={accent} strokeWidth="3" strokeLinecap="round" />
          <path d={`M ${cx + w / 2 - 8} ${y + 30} L ${cx + w / 2 - 8} ${y + h - 8}`} stroke={accent} strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    default:
      return null
  }
}

/* ------------------------------------------------------------- accessory */

function AccessoryLayer({
  style,
  color,
  cx,
  headCy,
  headR,
}: {
  style: string
  color: string
  cx: number
  headCy: number
  headR: number
}) {
  const eyeY = headCy - 4
  const top = headCy - headR
  switch (style) {
    case 'none':
      return null
    case 'glasses':
      return (
        <g stroke={color} strokeWidth="3" fill="none">
          <circle cx={cx - 17} cy={eyeY} r={14} />
          <circle cx={cx + 17} cy={eyeY} r={14} />
          <line x1={cx - 3} y1={eyeY} x2={cx + 3} y2={eyeY} />
        </g>
      )
    case 'sunglasses':
      return (
        <g>
          <rect x={cx - 34} y={eyeY - 11} width={26} height={22} rx={8} fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
          <rect x={cx + 8} y={eyeY - 11} width={26} height={22} rx={8} fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" />
          <line x1={cx - 8} y1={eyeY - 6} x2={cx + 8} y2={eyeY - 6} stroke={color} strokeWidth="4" />
        </g>
      )
    case 'bow':
      return (
        <g transform={`translate(${cx + 26} ${top + 10})`}>
          <path d="M 0 0 L -12 -9 L -12 9 Z" fill={color} />
          <path d="M 0 0 L 12 -9 L 12 9 Z" fill={color} />
          <circle cx="0" cy="0" r="4" fill="#ffffff" />
        </g>
      )
    case 'headphones':
      return (
        <g>
          <path d={`M ${cx - headR - 4} ${headCy - 6} A ${headR + 4} ${headR + 4} 0 0 1 ${cx + headR + 4} ${headCy - 6}`} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
          <rect x={cx - headR - 12} y={headCy - 16} width="14" height="26" rx="6" fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
          <rect x={cx + headR - 2} y={headCy - 16} width="14" height="26" rx="6" fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
        </g>
      )
    case 'mask':
      return (
        <g>
          <path d={`M ${cx - 30} ${headCy + 6} Q ${cx} ${headCy + 34} ${cx + 30} ${headCy + 6} Q ${cx + 20} ${headCy + 22} ${cx} ${headCy + 22} Q ${cx - 20} ${headCy + 22} ${cx - 30} ${headCy + 6} Z`} fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
        </g>
      )
    case 'goggles':
      return (
        <g>
          <circle cx={cx - 18} cy={top + 16} r={13} fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
          <circle cx={cx + 18} cy={top + 16} r={13} fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
          <circle cx={cx - 18} cy={top + 16} r={6} fill="#ffffff" opacity="0.7" />
          <circle cx={cx + 18} cy={top + 16} r={6} fill="#ffffff" opacity="0.7" />
        </g>
      )
    default:
      return null
  }
}

/* ------------------------------------------------------------------- pet */

function PetLayer({ style, color, outline }: { style: string; color: string; outline: string }) {
  if (style === 'none') return null
  const px = 162
  const py = 158
  switch (style) {
    case 'blob':
      return (
        <g>
          <ellipse cx={px} cy={py + 12} rx={20} ry={5} fill="rgba(0,0,0,0.3)" />
          <rect x={px - 18} y={py - 16} width={36} height={34} rx={17} fill={color} stroke={outline} strokeWidth="2" />
          <circle cx={px - 7} cy={py - 2} r={3.5} fill="#241a3d" />
          <circle cx={px + 7} cy={py - 2} r={3.5} fill="#241a3d" />
        </g>
      )
    case 'robot':
      return (
        <g>
          <ellipse cx={px} cy={py + 12} rx={18} ry={5} fill="rgba(0,0,0,0.3)" />
          <line x1={px} y1={py - 16} x2={px} y2={py - 26} stroke={outline} strokeWidth="2" />
          <circle cx={px} cy={py - 28} r={3.5} fill="#f472b6" />
          <rect x={px - 16} y={py - 16} width={32} height={32} rx={8} fill={color} stroke={outline} strokeWidth="2" />
          <circle cx={px - 6} cy={py - 2} r={3} fill="#22d3ee" />
          <circle cx={px + 6} cy={py - 2} r={3} fill="#22d3ee" />
        </g>
      )
    case 'cat':
      return (
        <g>
          <ellipse cx={px} cy={py + 12} rx={18} ry={5} fill="rgba(0,0,0,0.3)" />
          <path d={`M ${px + 6} ${py + 12} q 24 4 18 -18`} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx={px} cy={py - 2} r={17} fill={color} stroke={outline} strokeWidth="2" />
          <path d={`M ${px - 14} ${py - 14} L ${px - 10} ${py - 26} L ${px - 2} ${py - 16} Z`} fill={color} stroke={outline} strokeWidth="1.5" />
          <path d={`M ${px + 14} ${py - 14} L ${px + 10} ${py - 26} L ${px + 2} ${py - 16} Z`} fill={color} stroke={outline} strokeWidth="1.5" />
          <circle cx={px - 6} cy={py - 4} r={3} fill="#241a3d" />
          <circle cx={px + 6} cy={py - 4} r={3} fill="#241a3d" />
        </g>
      )
    case 'owl':
      return (
        <g>
          <ellipse cx={px} cy={py + 12} rx={18} ry={5} fill="rgba(0,0,0,0.3)" />
          <ellipse cx={px} cy={py - 2} rx={17} ry={19} fill={color} stroke={outline} strokeWidth="2" />
          <circle cx={px - 7} cy={py - 6} r={7} fill="#ffffff" />
          <circle cx={px + 7} cy={py - 6} r={7} fill="#ffffff" />
          <circle cx={px - 7} cy={py - 6} r={3.4} fill="#241a3d" />
          <circle cx={px + 7} cy={py - 6} r={3.4} fill="#241a3d" />
          <path d={`M ${px - 4} ${py + 2} L ${px + 4} ${py + 2} L ${px} ${py + 9} Z`} fill="#f59e0b" />
        </g>
      )
    case 'star':
      return (
        <g>
          <ellipse cx={px} cy={py + 12} rx={16} ry={5} fill="rgba(0,0,0,0.3)" />
          <path
            d={`M ${px} ${py - 24} L ${px + 7} ${py - 8} L ${px + 24} ${py - 6} L ${px + 11} ${py + 5} L ${px + 15} ${py + 21} L ${px} ${py + 12} L ${px - 15} ${py + 21} L ${px - 11} ${py + 5} L ${px - 24} ${py - 6} L ${px - 7} ${py - 8} Z`}
            fill={color}
            stroke={outline}
            strokeWidth="2"
          />
        </g>
      )
    case 'dragonling':
      return (
        <g>
          <ellipse cx={px} cy={py + 12} rx={18} ry={5} fill="rgba(0,0,0,0.3)" />
          <path d={`M ${px - 4} ${py - 6} Q ${px - 28} ${py - 26} ${px - 22} ${py + 6} Z`} fill={color} opacity="0.85" stroke={outline} strokeWidth="1.5" />
          <path d={`M ${px + 4} ${py - 6} Q ${px + 28} ${py - 26} ${px + 22} ${py + 6} Z`} fill={color} opacity="0.85" stroke={outline} strokeWidth="1.5" />
          <circle cx={px} cy={py - 2} r={15} fill={color} stroke={outline} strokeWidth="2" />
          <path d={`M ${px - 12} ${py - 12} L ${px - 12} ${py - 22} L ${px - 4} ${py - 14} Z`} fill="#fde68a" />
          <path d={`M ${px + 12} ${py - 12} L ${px + 12} ${py - 22} L ${px + 4} ${py - 14} Z`} fill="#fde68a" />
          <circle cx={px - 5} cy={py - 3} r={3} fill="#241a3d" />
          <circle cx={px + 5} cy={py - 3} r={3} fill="#241a3d" />
        </g>
      )
    default:
      return null
  }
}

/* ------------------------------------------------------------------ aura */

function AuraLayer({
  style,
  color,
  cx,
  bodyCy,
}: {
  style: string
  color: string
  cx: number
  bodyCy: number
}) {
  if (!style || style === 'none') return null
  const cy = 96
  switch (style) {
    case 'sparkle':
      return (
        <g fill={color}>
          {[
            [40, 40],
            [160, 44],
            [34, 130],
            [168, 132],
            [100, 20],
          ].map(([x, y], i) => (
            <path key={i} d={`M ${x} ${y - 8} L ${x + 2.5} ${y - 2.5} L ${x + 8} ${y} L ${x + 2.5} ${y + 2.5} L ${x} ${y + 8} L ${x - 2.5} ${y + 2.5} L ${x - 8} ${y} L ${x - 2.5} ${y - 2.5} Z`} opacity="0.9" />
          ))}
        </g>
      )
    case 'electric':
      return (
        <g stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85">
          <path d={`M 30 60 l 10 12 l -8 8 l 12 10`} />
          <path d={`M 170 58 l -10 12 l 8 8 l -12 10`} />
          <path d={`M 26 120 l 10 10 l -6 10 l 12 8`} />
          <path d={`M 174 122 l -10 10 l 6 10 l -12 8`} />
        </g>
      )
    case 'flame':
      return (
        <g fill={color} opacity="0.5">
          <path d={`M ${cx - 52} ${cy + 60} q -18 -40 6 -70 q 2 24 18 34 q -10 -30 8 -52 q 4 30 20 46 q 12 -18 6 -34 q 22 34 -2 76 z`} />
        </g>
      )
    case 'galaxy':
      return (
        <g>
          <circle cx={cx} cy={cy} r={78} fill={color} opacity="0.18" />
          <circle cx={cx} cy={cy} r={58} fill="#ffffff" opacity="0.07" />
          <g fill="#ffffff">
            {[
              [46, 50],
              [150, 60],
              [58, 140],
              [146, 138],
              [100, 30],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={2.2} />
            ))}
          </g>
        </g>
      )
    case 'rainbow':
      return (
        <g fill="none" strokeWidth="4" opacity="0.6">
          {['#f87171', '#fbbf24', '#a3e635', '#22d3ee', '#a78bfa'].map((c, i) => (
            <circle key={c} cx={cx} cy={cy} r={64 - i * 6} stroke={c} />
          ))}
        </g>
      )
    default:
      return null
  }
}

export default Avatar
