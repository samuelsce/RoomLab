import { useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { Copy, Trash2, RotateCw, ArrowUp, ArrowDown } from 'lucide-react'
import type { SceneObject } from './scenes'
import type { EditorAction } from './editorModel'
import { findItem } from '../catalog/catalog'
import { ObjectThumbnail } from '../catalog/ObjectArt'
import { sizeLimits } from './geometry'
import { isDesk, supportingDesk } from './surfaces'

interface Props {
  object: SceneObject
  objects: SceneObject[]
  update: (patch: Partial<SceneObject>) => void
  duplicate: () => void
  remove: () => void
  dispatch: (action: EditorAction) => void
  canDuplicate: boolean
}

function NumberControl({
  label,
  value,
  min,
  max,
  step = 1,
  onCommit,
}: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(Math.round(value * 10) / 10))
  const cancelled = useRef(false)
  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false
      return
    }
    const number = Number(draft)
    if (
      draft !== String(Math.round(value * 10) / 10) &&
      draft.trim() &&
      Number.isFinite(number)
    )
      onCommit(number)
    setDraft(String(Math.round(value * 10) / 10))
  }
  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur()
    if (event.key === 'Escape') {
      cancelled.current = true
      setDraft(String(Math.round(value * 10) / 10))
      event.currentTarget.blur()
    }
  }
  return (
    <label className="number-control">
      <span>{label}</span>
      <input
        type="number"
        value={draft}
        min={min}
        max={max}
        step={step}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
      />
    </label>
  )
}

const swatches = [
  { name: 'Madeira', color: '#b78d60' },
  { name: 'Grafite', color: '#334452' },
  { name: 'Verde', color: '#48705a' },
  { name: 'Azul', color: '#879ca8' },
  { name: 'Mostarda', color: '#d5a14c' },
  { name: 'Marfim', color: '#eeeae2' },
]

export function ObjectProperties({
  object,
  objects,
  update,
  duplicate,
  remove,
  dispatch,
  canDuplicate,
}: Props) {
  const item = findItem(object.kind)
  const limits = sizeLimits[object.kind]
  const attached = objects.filter((item) => item.attachedTo === object.id)
  const available = objects.filter(
    (item) =>
      !item.attachedTo && supportingDesk(item, objects)?.id === object.id,
  )
  return (
    <>
      <div className="selected-preview">
        <ObjectThumbnail kind={object.kind} color={object.color} />
      </div>
      <span className="preview-source">Objeto no quarto</span>
      <h3 className="selected-name">{item.name}</h3>
      <p className="selected-description">{item.description}</p>
      <div className="transform-controls" aria-label="Transformar objeto">
        <NumberControl
          key={`x-${object.id}-${object.x}`}
          label="Posição X"
          value={object.x}
          step={1}
          onCommit={(x) => update({ x })}
        />
        <NumberControl
          key={`y-${object.id}-${object.y}`}
          label="Posição Y"
          value={object.y}
          step={1}
          onCommit={(y) => update({ y })}
        />
        <NumberControl
          key={`w-${object.id}-${object.w}`}
          label="Largura"
          value={object.w}
          min={limits.minW}
          max={limits.maxW}
          onCommit={(w) => update({ w })}
        />
        <NumberControl
          key={`h-${object.id}-${object.h}`}
          label="Profundidade"
          value={object.h}
          min={limits.minH}
          max={limits.maxH}
          onCommit={(h) => update({ h })}
        />
        <NumberControl
          key={`r-${object.id}-${object.rotation}`}
          label="Rotação (°)"
          value={object.rotation ?? 0}
          step={15}
          onCommit={(rotation) => update({ rotation })}
        />
        <button
          className="rotate-button"
          onClick={() => update({ rotation: (object.rotation ?? 0) + 90 })}
        >
          <RotateCw size={17} aria-hidden="true" />
          Girar 90°
        </button>
      </div>
      <p className="unit-note">
        Posições e tamanhos em unidades do desenho (u). A profundidade mede o
        espaço da peça no piso.
      </p>
      {isDesk(object) && (
        <div className="equipment-group">
          <h4>Seu setup acompanha a mesa</h4>
          <p>
            {attached.length
              ? `${attached.length} equipamentos vinculados. Mova ou gire a mesa para levar o conjunto.`
              : 'Vincule os equipamentos que estão sobre esta mesa.'}
          </p>
          <button
            disabled={!available.length}
            onClick={() => dispatch({ type: 'attach', id: object.id })}
          >
            {attached.length
              ? 'Vincular novos equipamentos'
              : 'Mover com equipamentos'}
          </button>
          {attached.length > 0 && (
            <button onClick={() => dispatch({ type: 'detach', id: object.id })}>
              Desvincular equipamentos
            </button>
          )}
          <small>
            Redimensionar altera só a mesa. Peças que saem do tampo são
            desvinculadas.
          </small>
        </div>
      )}
      {object.attachedTo && (
        <div className="equipment-group">
          <p>
            Vinculado à mesa. Você pode ajustar esta peça separadamente; ela
            acompanha a mesa enquanto estiver sobre o tampo.
          </p>
          <button onClick={() => dispatch({ type: 'detach', id: object.id })}>
            Desvincular da mesa
          </button>
        </div>
      )}
      <fieldset className="color-options">
        <legend>Cor da peça</legend>
        <div>
          {swatches.map((swatch) => (
            <button
              key={swatch.color}
              aria-label={`Cor ${swatch.name}`}
              aria-pressed={object.color === swatch.color}
              style={{ '--swatch': swatch.color } as CSSProperties}
              onClick={() => update({ color: swatch.color })}
            >
              <span />
              {object.color === swatch.color && (
                <span className="color-check">✓</span>
              )}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="object-actions">
        <button onClick={duplicate} disabled={!canDuplicate}>
          <Copy size={16} aria-hidden="true" />
          Duplicar
        </button>
        <button className="delete-button" onClick={remove}>
          <Trash2 size={16} aria-hidden="true" />
          Excluir
        </button>
      </div>
      <div className="layer-actions">
        <button
          onClick={() =>
            dispatch({ type: 'layer', id: object.id, direction: 'front' })
          }
        >
          <ArrowUp size={15} aria-hidden="true" />
          Trazer para frente
        </button>
        <button
          onClick={() =>
            dispatch({ type: 'layer', id: object.id, direction: 'back' })
          }
        >
          <ArrowDown size={15} aria-hidden="true" />
          Enviar para trás
        </button>
      </div>
    </>
  )
}
