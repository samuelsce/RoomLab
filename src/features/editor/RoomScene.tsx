import { useId, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { findItem } from '../catalog/catalog'
import { ObjectArt } from '../catalog/ObjectArt'

import { getSceneObjects } from './scenes'
import type { SceneName, SceneObject } from './scenes'
import { moveObject, resizeObject, ROOM, GRID_SIZE } from './geometry'
import type { EditorAction } from './editorModel'

interface Props {
  scene?: SceneName
  selected?: string | null
  onSelect?: (object: SceneObject, reveal?: boolean) => void
  objects?: SceneObject[]
  onEdit?: (action: EditorAction) => void
  onDeselect?: () => void
  onDropObject?: (kind: string, point: { x: number; y: number }) => void
  showGrid?: boolean
  showMeasurements?: boolean
}

export function RoomScene({
  scene = 'study',
  selected,
  onSelect,
  objects: suppliedObjects,
  onEdit,
  onDeselect,
  onDropObject,
  showGrid = false,
  showMeasurements = false,
}: Props) {
  const id = useId().replace(/:/g, '')
  const objects = suppliedObjects ?? getSceneObjects(scene)
  const svgRef = useRef<SVGSVGElement>(null)
  const gesture = useRef<{
    object: SceneObject
    start: DOMPoint
    mode: 'move' | 'resize'
    pointerId: number
    capture: SVGRectElement
  } | null>(null)
  const pointFromClient = (x: number, y: number) => {
    const matrix = svgRef.current?.getScreenCTM()
    return matrix ? new DOMPoint(x, y).matrixTransform(matrix.inverse()) : null
  }
  const startGesture = (
    event: ReactPointerEvent<SVGRectElement>,
    object: SceneObject,
    mode: 'move' | 'resize',
  ) => {
    if (!onEdit || !event.isPrimary || event.button !== 0 || gesture.current)
      return
    const start = pointFromClient(event.clientX, event.clientY)
    if (!start) return
    event.stopPropagation()
    onSelect?.(object, false)
    event.currentTarget.focus({ preventScroll: true })
    gesture.current = {
      object,
      start,
      mode,
      pointerId: event.pointerId,
      capture: event.currentTarget,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    onEdit({ type: 'begin' })
  }
  const endGesture = (cancel: boolean) => {
    const current = gesture.current
    if (!current) return
    gesture.current = null
    onEdit?.({ type: cancel ? 'cancel' : 'end' })
    if (cancel && current.capture.hasPointerCapture(current.pointerId))
      current.capture.releasePointerCapture(current.pointerId)
  }
  return (
    <svg
      className="room-scene"
      ref={svgRef}
      data-testid={onEdit ? 'editable-room' : undefined}
      viewBox="0 0 760 610"
      role={onSelect ? 'group' : 'img'}
      aria-label={
        objects.length === 0
          ? 'Quarto vazio em vista superior'
          : onEdit
            ? 'Quarto em vista superior com peças editáveis'
            : 'Composição do quarto em vista superior'
      }
      onPointerDown={(event) => {
        if (onEdit && !(event.target as Element).closest('[data-object-id]'))
          onDeselect?.()
      }}
      onPointerMove={(event) => {
        const current = gesture.current
        if (!current || event.pointerId !== current.pointerId) return
        const point = pointFromClient(event.clientX, event.clientY)
        if (!point) return
        const dx = point.x - current.start.x
        const dy = point.y - current.start.y
        const object =
          current.mode === 'move'
            ? moveObject(
                current.object,
                current.object.x + dx,
                current.object.y + dy,
                showGrid,
              )
            : resizeObject(current.object, dx, dy)
        onEdit?.({ type: 'preview', object })
      }}
      onPointerUp={(event) => {
        if (event.pointerId === gesture.current?.pointerId) endGesture(false)
      }}
      onPointerCancel={() => endGesture(true)}
      onLostPointerCapture={() => endGesture(true)}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && gesture.current) {
          event.preventDefault()
          event.stopPropagation()
          endGesture(true)
        }
      }}
      onDragOver={(event) => {
        if (onEdit) event.preventDefault()
      }}
      onDrop={(event) => {
        if (!onEdit) return
        event.preventDefault()
        const kind = event.dataTransfer.getData('application/roomlab-object')
        const point = pointFromClient(event.clientX, event.clientY)
        if (
          point &&
          point.x >= ROOM.left &&
          point.x <= ROOM.left + ROOM.width &&
          point.y >= ROOM.top &&
          point.y <= ROOM.top + ROOM.height
        ) {
          onDropObject?.(kind, { x: point.x, y: point.y })
        }
      }}
    >
      <defs>
        <pattern
          id={`${id}-grid`}
          x={ROOM.left}
          y={ROOM.top}
          width={GRID_SIZE}
          height={GRID_SIZE}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M${GRID_SIZE} 0H0V${GRID_SIZE}`}
            fill="none"
            stroke="#405f8b"
            strokeOpacity=".25"
            strokeWidth=".7"
          />
        </pattern>
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
      {showGrid && (
        <rect
          x={ROOM.left}
          y={ROOM.top}
          width={ROOM.width}
          height={ROOM.height}
          fill={`url(#${id}-grid)`}
          pointerEvents="none"
        />
      )}
      {objects.map((object) => (
        <g
          key={object.id}
          data-object-id={onEdit ? object.id : undefined}
          transform={`translate(${object.x} ${object.y}) rotate(${object.rotation ?? 0} ${object.w / 2} ${object.h / 2})`}
        >
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
              aria-pressed={selected === object.id}
              onPointerDown={(event) => startGesture(event, object, 'move')}
              onClick={() => {
                if (!onEdit) onSelect(object)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(object)
                }
              }}
            />
          )}
          {onEdit && selected === object.id && (
            <g>
              <rect
                x={object.w - 6}
                y={object.h - 6}
                width="12"
                height="12"
                rx="2"
                fill="#2457d6"
                stroke="white"
                strokeWidth="2"
                pointerEvents="none"
              />
              <rect
                className="resize-hit-area"
                x={object.w - 16}
                y={object.h - 16}
                width="32"
                height="32"
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={`Redimensionar ${findItem(object.kind).name.toLowerCase()}`}
                onPointerDown={(event) => startGesture(event, object, 'resize')}
                onKeyDown={(event) => {
                  const step = event.shiftKey ? 10 : 2
                  const deltas: Record<string, [number, number]> = {
                    ArrowRight: [step, 0],
                    ArrowLeft: [-step, 0],
                    ArrowDown: [0, step],
                    ArrowUp: [0, -step],
                  }
                  const delta = deltas[event.key]
                  if (delta) {
                    event.preventDefault()
                    event.stopPropagation()
                    onEdit({
                      type: 'update',
                      id: object.id,
                      patch: resizeObject(object, ...delta),
                    })
                  }
                }}
              />
            </g>
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
