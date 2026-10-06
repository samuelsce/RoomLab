import type { ObjectKind } from './catalog'

interface Props {
  kind: ObjectKind
  color: string
}

// One drawing per object, shared by the catalog and room composition.
export function ObjectArt({ kind, color }: Props) {
  switch (kind) {
    case 'desk':
    case 'round-desk':
      return (
        <g>
          <rect
            x="8"
            y="24"
            width="104"
            height="62"
            rx={kind === 'desk' ? 5 : 23}
            fill="#71563e"
          />
          <rect
            x="8"
            y="18"
            width="104"
            height="62"
            rx={kind === 'desk' ? 5 : 23}
            fill={color}
          />
          <path
            d="M16 35h88M16 52h88M16 68h88"
            stroke="#ffffff"
            opacity=".16"
          />
          <path
            d="M25 24h28m20 18h27M30 62h25"
            stroke="#72563d"
            opacity=".2"
            strokeWidth="2"
          />
        </g>
      )
    case 'monitor':
    case 'dual-monitor':
      return (
        <g>
          {Array.from({ length: kind === 'monitor' ? 1 : 2 }, (_, i) => (
            <g
              key={i}
              transform={
                kind === 'dual-monitor'
                  ? `translate(${i * 58} 13) scale(.53 .8)`
                  : undefined
              }
            >
              <ellipse cx="60" cy="81" rx="23" ry="6" fill="#253744" />
              <rect x="55" y="53" width="10" height="27" fill={color} />
              <rect x="10" y="10" width="100" height="56" rx="5" fill={color} />
              <rect
                x="15"
                y="15"
                width="90"
                height="45"
                rx="2"
                fill="#263959"
              />
              <path
                d="M15 52C42 15 61 76 105 27M15 60C48 27 66 73 105 40"
                stroke="#927cf6"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M15 46C51 5 60 61 105 20"
                stroke="#59dcd6"
                strokeWidth="2"
                fill="none"
              />
              <rect x="15" y="56" width="90" height="4" fill="#65738a" />
            </g>
          ))}
        </g>
      )
    case 'chair':
      return (
        <g>
          {[-90, -18, 54, 126, 198].map((angle) => {
            const radians = (angle * Math.PI) / 180
            const x = 60 + Math.cos(radians) * 39
            const y = 70 + Math.sin(radians) * 24
            return (
              <g key={angle}>
                <path
                  d={`M60 70L${x} ${y}`}
                  stroke="#45515b"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <rect
                  x={x - 5}
                  y={y - 3}
                  width="10"
                  height="6"
                  rx="2"
                  fill="#25313b"
                  transform={`rotate(${angle + 90} ${x} ${y})`}
                />
              </g>
            )
          })}
          <rect x="28" y="32" width="64" height="46" rx="17" fill={color} />
          <rect x="22" y="16" width="76" height="30" rx="12" fill={color} />
          <path d="M31 28h58" stroke="white" opacity=".17" strokeWidth="3" />
          <path
            d="M22 43v23m76-23v23"
            stroke="#253744"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </g>
      )
    case 'pc':
      return (
        <g>
          <rect x="29" y="9" width="65" height="82" rx="7" fill="#202b38" />
          <rect x="26" y="6" width="62" height="82" rx="7" fill={color} />
          <rect x="32" y="13" width="50" height="64" rx="3" fill="#1e2d3b" />
          <circle
            cx="57"
            cy="33"
            r="13"
            stroke="#91b4c0"
            strokeWidth="3"
            fill="#344856"
          />
          <circle
            cx="57"
            cy="60"
            r="13"
            stroke="#91b4c0"
            strokeWidth="3"
            fill="#344856"
          />
          <circle cx="76" cy="82" r="2" fill="#c9decf" />
        </g>
      )
    case 'keyboard':
      return (
        <g>
          <rect x="5" y="29" width="110" height="46" rx="5" fill="#8b959b" />
          <rect x="5" y="25" width="110" height="45" rx="5" fill={color} />
          {Array.from({ length: 30 }, (_, i) => (
            <rect
              key={i}
              x={12 + (i % 10) * 10}
              y={32 + Math.floor(i / 10) * 9}
              width="7"
              height="6"
              rx="1"
              fill={i === 0 ? '#b78d60' : '#89969a'}
            />
          ))}
          <rect x="36" y="61" width="45" height="5" rx="1" fill="#89969a" />
        </g>
      )
    case 'lamp':
      return (
        <g>
          <ellipse cx="60" cy="75" rx="27" ry="15" fill="#aa7938" />
          <ellipse cx="60" cy="71" rx="27" ry="15" fill={color} />
          <path
            d="M60 70V40l18-15"
            stroke="#7e6a50"
            strokeWidth="5"
            fill="none"
          />
          <path d="m63 18 20-4 17 22-27 12Z" fill={color} />
          <path d="m73 48 27-12" stroke="#fff1c5" strokeWidth="4" />
        </g>
      )
    case 'plant':
      return (
        <g>
          <circle cx="60" cy="53" r="28" fill="#bc9875" />
          <circle cx="60" cy="50" r="23" fill="#665c45" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <g key={angle} transform={`rotate(${angle} 60 50)`}>
              <ellipse cx="60" cy="30" rx="13" ry="27" fill={color} />
              <path d="M60 50V9" stroke="#d2dfb7" opacity=".35" />
            </g>
          ))}
          <ellipse
            cx="63"
            cy="46"
            rx="10"
            ry="20"
            transform="rotate(35 63 46)"
            fill="#6d9367"
          />
        </g>
      )
    case 'rug':
      return (
        <g>
          <rect x="5" y="14" width="110" height="73" rx="3" fill={color} />
          <rect
            x="14"
            y="22"
            width="92"
            height="57"
            rx="2"
            fill="none"
            stroke="white"
            opacity=".35"
            strokeWidth="2"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d={`M${12 + i * 9} 8v7m0 72v6`}
              stroke={color}
              strokeWidth="3"
            />
          ))}
          <path
            d="M25 61 43 41 61 61 79 41 97 61"
            stroke="white"
            opacity=".45"
            strokeWidth="3"
            fill="none"
          />
        </g>
      )
    case 'frame':
      return (
        <g>
          <rect x="26" y="7" width="68" height="86" rx="2" fill="#b78d60" />
          <rect x="32" y="13" width="56" height="74" fill="#f5f2e9" />
          <circle cx="60" cy="37" r="16" fill={color} />
          <path d="M39 76V52h20v24m4 0V45h18v31" fill="#48705a" />
        </g>
      )
    case 'bed':
      return (
        <g>
          <rect x="14" y="3" width="92" height="94" rx="5" fill="#a48667" />
          <rect x="18" y="8" width="84" height="84" rx="5" fill="#f1f0ea" />
          <rect x="18" y="36" width="84" height="56" rx="4" fill={color} />
          <path
            d="M19 44h82M19 80h82"
            stroke="white"
            opacity=".22"
            strokeWidth="4"
          />
          <rect x="25" y="14" width="30" height="18" rx="5" fill="white" />
          <rect x="65" y="14" width="30" height="18" rx="5" fill="white" />
        </g>
      )
    case 'shelf':
      return (
        <g>
          <rect x="5" y="26" width="110" height="54" rx="3" fill="#795d42" />
          <rect x="5" y="22" width="110" height="50" rx="3" fill={color} />
          <path d="M9 68h102" stroke="#7b6047" strokeWidth="2" />
          <rect x="17" y="28" width="11" height="32" fill="#658187" />
          <rect x="31" y="28" width="9" height="32" fill="#e1cba6" />
          <rect x="43" y="28" width="10" height="32" fill="#d0986d" />
          <rect
            x="58"
            y="29"
            width="10"
            height="31"
            transform="rotate(-12 58 29)"
            fill="#55725f"
          />
          <circle cx="92" cy="44" r="14" fill="#e6d6bf" />
        </g>
      )
  }
}

export function ObjectThumbnail({ kind, color }: Props) {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true" className="object-thumbnail">
      <ObjectArt kind={kind} color={color} />
    </svg>
  )
}
