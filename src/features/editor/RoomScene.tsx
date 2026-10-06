import { useId } from 'react'
import { findItem } from '../catalog/catalog'
import { ObjectArt } from '../catalog/ObjectArt'

import { getSceneObjects } from './scenes'
import type { SceneName, SceneObject } from './scenes'

interface Props {
  scene?: SceneName
  selected?: string | null
  onSelect?: (object: SceneObject) => void
  showMeasurements?: boolean
}

export function RoomScene({
  scene = 'study',
  selected,
  onSelect,
  showMeasurements = false,
}: Props) {
  const id = useId().replace(/:/g, '')
  const objects = getSceneObjects(scene)
  return (
    <svg
      className="room-scene"
      viewBox="0 0 760 610"
      role={onSelect ? 'group' : 'img'}
      aria-label={
        scene === 'empty'
          ? 'Quarto vazio em vista superior'
          : 'Quarto ilustrado em vista superior com mesa, monitor, cadeira e plantas'
      }
    >
      <defs>
        <pattern
          id={`${id}-floor`}
          width="76"
          height="42"
          patternUnits="userSpaceOnUse"
        >
          <rect width="76" height="42" fill="#e0cfb6" />
          <path
            d="M0 0H76M0 42H76M38 0v42"
            stroke="#c7b393"
            strokeWidth="1"
            opacity=".5"
          />
          <path d="M5 10h23m19 17h22M4 33h15" stroke="#c7b393" opacity=".4" />
        </pattern>
        <filter
          id={`${id}-shadow`}
          x="-40%"
          y="-40%"
          width="180%"
          height="190%"
        >
          <feDropShadow
            dx="2"
            dy="8"
            stdDeviation="5"
            floodColor="#334452"
            floodOpacity=".16"
          />
        </filter>
        <filter
          id={`${id}-roomShadow`}
          x="-20%"
          y="-20%"
          width="150%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="18"
            stdDeviation="14"
            floodColor="#334452"
            floodOpacity=".16"
          />
        </filter>
      </defs>
      <g filter={`url(#${id}-roomShadow)`}>
        <rect x="110" y="87" width="540" height="431" rx="3" fill="#a7b1b5" />
        <rect
          x="119"
          y="94"
          width="522"
          height="410"
          fill={`url(#${id}-floor)`}
        />
        <path
          d="M110 504V83h540v421"
          fill="none"
          stroke="#fff"
          strokeWidth="16"
        />
        <path d="M119 94h522v15H119Z" fill="#526574" opacity=".14" />
        <path d="M114 508h93m94 0h349" stroke="#fff" strokeWidth="16" />
        <path
          d="M208 507v-83a83 83 0 0 1 83 83"
          stroke="#a18e73"
          strokeWidth="1.4"
          strokeDasharray="4 4"
          fill="none"
        />
        <path d="M208 507v-83" stroke="#fff" strokeWidth="7" />
        <rect
          x="645"
          y="213"
          width="12"
          height="142"
          fill="#d2e4eb"
          stroke="#90b0bf"
          strokeWidth="2"
        />
        <path d="M651 213v142m-6-72h12" stroke="#fff" strokeWidth="3" />
      </g>
      <path d="m640 244-160 70v121l160-83Z" fill="#fff" opacity=".14" />
      {objects.map((object) => (
        <g key={object.id} transform={`translate(${object.x} ${object.y})`}>
          {selected === object.id && (
            <rect
              x="-5"
              y="-5"
              width={object.w + 10}
              height={object.h + 10}
              rx="5"
              fill="#2457d6"
              fillOpacity=".07"
              stroke="#2457d6"
              strokeWidth="2"
              strokeDasharray="5 3"
            />
          )}
          <g
            transform={`scale(${object.w / 120} ${object.h / 100})`}
            filter={object.kind === 'rug' ? undefined : `url(#${id}-shadow)`}
          >
            <ObjectArt kind={object.kind} color={object.color} />
          </g>
          {onSelect && (
            <rect
              className="scene-hit-area"
              width={object.w}
              height={object.h}
              fill="transparent"
              role="button"
              tabIndex={0}
              aria-label={`Selecionar ${findItem(object.kind).name.toLowerCase()}`}
              onClick={() => onSelect(object)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(object)
                }
              }}
            />
          )}
        </g>
      ))}
      {showMeasurements && (
        <g fill="#586575" fontSize="15" fontFamily="Barlow, sans-serif">
          <path d="M115 557h530m-530-6v12m530-12v12" stroke="#8e9ba9" />
          <rect x="328" y="543" width="100" height="28" fill="#e8edf2" />
          <text x="380" y="563" textAnchor="middle">
            3,60 m
          </text>
          <text
            x="698"
            y="310"
            textAnchor="middle"
            transform="rotate(90 698 310)"
          >
            2,80 m
          </text>
        </g>
      )}
    </svg>
  )
}
