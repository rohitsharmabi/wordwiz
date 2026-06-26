import type { DragonState } from '../types'

export type DragonMood = 'idle' | 'happy' | 'celebrate' | 'sleepy'

type Props = {
  dragonState: DragonState
  mood?: DragonMood
  size?: number
  onClick?: () => void
}

const COLOURS: Record<string, [string, string, string, string]> = {
  green:  ['#4CAF50', '#A5D6A7', '#388E3C', '#FFF176'],
  blue:   ['#2196F3', '#BBDEFB', '#1565C0', '#FFF176'],
  purple: ['#9C27B0', '#E1BEE7', '#6A1B9A', '#FFF176'],
  pink:   ['#E91E8C', '#FCE4EC', '#AD1457', '#FFF176'],
  teal:   ['#009688', '#B2DFDB', '#00695C', '#FFF176'],
  red:    ['#F44336', '#FFCDD2', '#B71C1C', '#FFF9C4'],
  gold:   ['#FFC107', '#FFF9C4', '#FF8F00', '#FFFFFF'],
}

const AURA_CFG: Record<string, Array<[number, number, number, string]>> = {
  sparkles: [[38,65,4,'#FFD700'],[162,55,3,'#FFD700'],[28,135,5,'#FFF176'],[172,145,3,'#FFD700'],[48,175,4,'#FFF9C4'],[155,172,3,'#FFD700']],
  fire:     [[36,80,6,'#FF6F00'],[164,70,5,'#FF8F00'],[28,152,7,'#FF6D00'],[172,158,5,'#FFAB40'],[52,185,6,'#FF6F00'],[148,185,5,'#FF8F00']],
  ice:      [[36,72,5,'#80DEEA'],[164,62,4,'#B2EBF2'],[26,142,6,'#80DEEA'],[174,152,4,'#E0F7FA'],[48,182,5,'#B2EBF2'],[152,182,4,'#80DEEA']],
  stars:    [[33,57,5,'#FFD700'],[167,47,4,'#FFF176'],[23,137,6,'#FFD700'],[177,147,4,'#FFF9C4'],[43,187,5,'#FFD700'],[158,187,4,'#FFF176']],
  rainbow:  [[33,67,5,'#FF4081'],[167,57,4,'#FF6D00'],[26,132,6,'#FFD600'],[177,142,4,'#00E676'],[40,182,5,'#2979FF'],[160,180,4,'#D500F9']],
}

const DELAYS = ['0s','0.2s','0.4s','0.6s','0.8s','1s']

export default function Dragon({ dragonState, mood = 'idle', size = 200, onClick }: Props) {
  const [body, belly, shade, horn] = COLOURS[dragonState.colour] ?? COLOURS.green
  const { hat, accessory: acc, aura } = dragonState

  const sleepy = mood === 'sleepy'
  const happy  = mood === 'happy' || mood === 'celebrate'
  const celeb  = mood === 'celebrate'
  const eRy    = sleepy ? 4 : 7
  const pRy    = sleepy ? 2 : 4
  const pCy    = sleepy ? 80 : 78

  const particles = aura !== 'none' ? (AURA_CFG[aura] ?? []) : []

  return (
    <div
      className={`dragon-wrapper dragon-${mood}`}
      style={{ width: size, height: size, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Open Dragon Shop' : undefined}
    >
      <svg viewBox="0 0 200 210" width={size} height={size} xmlns="http://www.w3.org/2000/svg">

        {acc === 'cape' && <path d="M72,115 Q58,158 64,192 Q100,202 136,192 Q142,158 128,115 Q100,127 72,115Z" fill="#7B1FA2" stroke="#4A148C" strokeWidth="1.5" />}

        {particles.map(([cx,cy,r,fill], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={fill} className="aura-particle" style={{ animationDelay: DELAYS[i] }} />
        ))}

        <path d="M128,168 Q158,187 153,207 Q143,212 138,200 Q136,190 123,180" fill={body} stroke={shade} strokeWidth="1.5" />
        <path d="M78,122 Q44,96 41,70 Q54,81 71,107" fill={shade} opacity="0.85" />
        <path d="M122,122 Q156,96 159,70 Q146,81 129,107" fill={shade} opacity="0.85" />
        <ellipse cx="100" cy="150" rx="38" ry="48" fill={body} stroke={shade} strokeWidth="1.5" />
        <ellipse cx="100" cy="155" rx="22" ry="32" fill={belly} />
        <ellipse cx="68"  cy="158" rx="12" ry="8"  fill={body} stroke={shade} strokeWidth="1" transform="rotate(-25,68,158)" />
        <ellipse cx="132" cy="158" rx="12" ry="8"  fill={body} stroke={shade} strokeWidth="1" transform="rotate(25,132,158)" />
        <path d="M60,162 Q55,168 57,173M65,165 Q62,172 64,177" stroke={shade} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M140,162 Q145,168 143,173M135,165 Q138,172 136,177" stroke={shade} strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="82"  cy="192" rx="14" ry="9"  fill={body} stroke={shade} strokeWidth="1" />
        <ellipse cx="118" cy="192" rx="14" ry="9"  fill={body} stroke={shade} strokeWidth="1" />
        <ellipse cx="80"  cy="200" rx="12" ry="6"  fill={shade} />
        <ellipse cx="120" cy="200" rx="12" ry="6"  fill={shade} />
        <ellipse cx="100" cy="112" rx="18" ry="12" fill={body} stroke={shade} strokeWidth="1.5" />
        <ellipse cx="100" cy="75"  rx="28" ry="26" fill={body} stroke={shade} strokeWidth="1.5" />
        <ellipse cx="100" cy="90"  rx="14" ry="9"  fill={shade} />
        <ellipse cx="100" cy="91"  rx="10" ry="6"  fill={belly} />
        <circle cx="96" cy="89" r="2" fill={shade} opacity="0.6" />
        <circle cx="104" cy="89" r="2" fill={shade} opacity="0.6" />
        <polygon points="88,52 84,38 92,52" fill={horn} stroke={shade} strokeWidth="1" />
        <polygon points="112,52 108,38 116,52" fill={horn} stroke={shade} strokeWidth="1" />
        <polygon points="76,62 68,52 78,58" fill={shade} />
        <polygon points="124,62 132,52 122,58" fill={shade} />

        <ellipse cx="90"  cy="75" rx="7" ry={eRy} fill="white" />
        <ellipse cx="110" cy="75" rx="7" ry={eRy} fill="white" />
        {celeb ? (
          <g>
            <text x="90"  y="79" fontSize="9" textAnchor="middle" fill="#FFD700">★</text>
            <text x="110" y="79" fontSize="9" textAnchor="middle" fill="#FFD700">★</text>
          </g>
        ) : (
          <g>
            <ellipse cx="90"  cy={pCy} rx="4" ry={pRy} fill="#1a1a1a" />
            <ellipse cx="110" cy={pCy} rx="4" ry={pRy} fill="#1a1a1a" />
            <circle  cx="92"  cy={pCy - 1} r="1.5" fill="white" />
            <circle  cx="112" cy={pCy - 1} r="1.5" fill="white" />
          </g>
        )}

        {sleepy && (
          <g>
            <rect x="83" y="70" width="14" height="8" fill={body} rx="2" />
            <rect x="103" y="70" width="14" height="8" fill={body} rx="2" />
            <text x="100" y="60" fontSize="10" textAnchor="middle" fill={shade} opacity="0.7">z z z</text>
          </g>
        )}

        {happy && (
          <g>
            <ellipse cx="79"  cy="84" rx="6" ry="4" fill="#FF8A80" opacity="0.5" />
            <ellipse cx="121" cy="84" rx="6" ry="4" fill="#FF8A80" opacity="0.5" />
          </g>
        )}

        {happy
          ? <path d="M90,95 Q100,103 110,95" stroke={shade} strokeWidth="2" fill="none" strokeLinecap="round" />
          : sleepy
            ? <path d="M93,96 Q100,99 107,96" stroke={shade} strokeWidth="2" fill="none" strokeLinecap="round" />
            : <path d="M92,95 Q100,101 108,95" stroke={shade} strokeWidth="2" fill="none" strokeLinecap="round" />
        }

        {acc === 'scarf'   && <path d="M76,108 Q100,118 124,108" stroke="#FF7043" strokeWidth="10" strokeLinecap="round" fill="none" />}
        {acc === 'bowtie'  && <g><polygon points="84,118 96,112 96,124" fill="#FF4081" /><polygon points="116,118 104,112 104,124" fill="#FF4081" /><circle cx="100" cy="118" r="5" fill="#FF80AB" /></g>}
        {acc === 'glasses' && <g><circle cx="90" cy="78" r="8" fill="#87CEEB" fillOpacity="0.25" /><circle cx="110" cy="78" r="8" fill="#87CEEB" fillOpacity="0.25" /><circle cx="90" cy="78" r="8" fill="none" stroke="#333" strokeWidth="2.5" /><circle cx="110" cy="78" r="8" fill="none" stroke="#333" strokeWidth="2.5" /><line x1="98" y1="78" x2="102" y2="78" stroke="#333" strokeWidth="2" /><line x1="82" y1="78" x2="76" y2="75" stroke="#333" strokeWidth="2" /><line x1="118" y1="78" x2="124" y2="75" stroke="#333" strokeWidth="2" /></g>}
        {acc === 'monocle' && <g><circle cx="112" cy="76" r="9" fill="#87CEEB" fillOpacity="0.2" /><circle cx="112" cy="76" r="9" fill="none" stroke="#B8860B" strokeWidth="2.5" /><line x1="121" y1="80" x2="125" y2="90" stroke="#B8860B" strokeWidth="1.5" /></g>}

        {hat === 'party'      && <g><polygon points="100,10 85,52 115,52" fill="#FF4081" stroke="#C51162" strokeWidth="1.5" /><circle cx="100" cy="10" r="4" fill="#FFD700" /><circle cx="90" cy="38" r="3" fill="#FFD700" /><circle cx="110" cy="38" r="3" fill="#64B5F6" /></g>}
        {hat === 'wizard'     && <g><polygon points="100,5 82,54 118,54" fill="#5C35CC" stroke="#3A1A8C" strokeWidth="1.5" /><ellipse cx="100" cy="54" rx="18" ry="5" fill="#7B52D9" /><circle cx="92" cy="30" r="3" fill="#FFD700" /><circle cx="108" cy="42" r="2" fill="#FFD700" /></g>}
        {hat === 'crown'      && <g><rect x="82" y="42" width="36" height="14" rx="2" fill="#FFD700" stroke="#FF8F00" strokeWidth="1" /><polygon points="82,42 88,30 94,42" fill="#FFD700" stroke="#FF8F00" strokeWidth="1" /><polygon points="94,42 100,28 106,42" fill="#FFD700" stroke="#FF8F00" strokeWidth="1" /><polygon points="106,42 112,30 118,42" fill="#FFD700" stroke="#FF8F00" strokeWidth="1" /><circle cx="100" cy="36" r="4" fill="#FF4081" /></g>}
        {hat === 'viking'     && <g><rect x="80" y="42" width="40" height="14" rx="3" fill="#A1887F" stroke="#5D4037" strokeWidth="1.5" /><path d="M80,46 Q72,38 70,30" stroke="#CFD8DC" strokeWidth="4" strokeLinecap="round" fill="none" /><circle cx="70" cy="30" r="4" fill="#CFD8DC" /><path d="M120,46 Q128,38 130,30" stroke="#CFD8DC" strokeWidth="4" strokeLinecap="round" fill="none" /><circle cx="130" cy="30" r="4" fill="#CFD8DC" /></g>}
        {hat === 'graduation' && <g><polygon points="100,32 75,46 125,46" fill="#1A237E" /><rect x="83" y="46" width="34" height="8" rx="2" fill="#1A237E" /><line x1="122" y1="46" x2="128" y2="58" stroke="#FFD700" strokeWidth="2" /><circle cx="128" cy="60" r="4" fill="#FFD700" /></g>}

      </svg>
    </div>
  )
}
