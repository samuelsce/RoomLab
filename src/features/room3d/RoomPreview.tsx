import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Moon,
  Sun,
  MousePointer2,
  X,
} from 'lucide-react'
import { findItem } from '../catalog/catalog'
import { getSceneObjects } from '../editor/scenes'
import type { SceneName, SceneObject } from '../editor/scenes'
import { RoomScene } from '../editor/RoomScene'
import { defaultAppearance } from '../editor/appearance'
import type { RoomAppearance } from '../editor/appearance'

const RoomCanvas = lazy(() => import('./RoomCanvas'))

class RenderBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onUnavailable: () => void },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onUnavailable()
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export function RoomPreview({
  scene,
  objects: suppliedObjects,
  controls = true,
  selectedId,
  onSelect,
  appearance: suppliedAppearance,
}: {
  scene: SceneName
  objects?: SceneObject[]
  controls?: boolean
  selectedId?: string
  onSelect?: (id: string | null) => void
  appearance?: RoomAppearance
}) {
  const objects = useMemo(
    () => suppliedObjects ?? getSceneObjects(scene),
    [scene, suppliedObjects],
  )
  const [unavailable, setUnavailable] = useState(false)
  const appearance = useMemo(
    () => suppliedAppearance ?? defaultAppearance(scene),
    [suppliedAppearance, scene],
  )
  const [ready, setReady] = useState(false)
  const [command, setCommand] = useState<{
    action: 'left' | 'right' | 'reset'
    version: number
  }>({ action: 'reset', version: 0 })
  const turn = (action: 'left' | 'right' | 'reset') =>
    setCommand((previous) => ({ action, version: previous.version + 1 }))
  const [light, setLight] = useState<'day' | 'night' | null>(null)
  const night = light === null ? scene === 'gamer' : light === 'night'
  const onReady = useCallback(() => setReady(true), [])
  const onUnavailable = useCallback(() => setUnavailable(true), [])
  const selected = objects.find((object) => object.id === selectedId)
  const fallback = (
    <div className="room-fallback">
      <RoomScene scene={scene} objects={objects} appearance={appearance} />
      <p>Visualização em planta. O 3D não está disponível neste dispositivo.</p>
    </div>
  )
  return (
    <div
      className={`room-preview ${night ? 'room-preview-night' : ''}`}
      data-ready={ready}
    >
      <div className="room-canvas-wrap">
        {unavailable ? (
          fallback
        ) : (
          <RenderBoundary fallback={fallback} onUnavailable={onUnavailable}>
            <Suspense
              fallback={
                <div className="room-loading" role="status">
                  Preparando seu quarto…
                </div>
              }
            >
              <RoomCanvas
                scene={scene}
                appearance={appearance}
                objects={objects}
                night={night}
                command={command}
                onReady={onReady}
                onUnavailable={onUnavailable}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            </Suspense>
          </RenderBoundary>
        )}
        {onSelect && ready && !unavailable && (
          <div className="room-selection">
            <MousePointer2 size={16} aria-hidden="true" />
            <span role="status">
              {selected
                ? findItem(selected.kind).name
                : 'Toque ou clique numa peça'}
            </span>
            {selected && (
              <button
                aria-label="Limpar seleção"
                onClick={() => onSelect(null)}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </div>
      {controls && !unavailable && (
        <div className="preview-controls">
          <span className="preview-hint">Arraste para olhar ao redor</span>
          <div className="camera-controls" aria-label="Câmera do quarto">
            <button
              aria-label="Girar vista para a esquerda"
              onClick={() => turn('left')}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              aria-label="Restaurar vista 3D"
              onClick={() => turn('reset')}
            >
              <RotateCcw size={16} aria-hidden="true" />
            </button>
            <button
              aria-label="Girar vista para a direita"
              onClick={() => turn('right')}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
          <button
            className="light-control"
            aria-pressed={night}
            onClick={() => setLight(night ? 'day' : 'night')}
          >
            {night ? (
              <Moon size={16} aria-hidden="true" />
            ) : (
              <Sun size={16} aria-hidden="true" />
            )}{' '}
            Luz {night ? 'noturna' : 'natural'}
          </button>
        </div>
      )}
    </div>
  )
}
