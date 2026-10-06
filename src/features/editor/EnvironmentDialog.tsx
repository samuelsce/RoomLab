import { useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'
import { defaultAppearance, floors, wallPaints } from './appearance'
import type { RoomAppearance } from './appearance'
import type { SceneName } from './scenes'
import type { EditorAction } from './editorModel'

export function EnvironmentDialog({
  scene,
  appearance,
  dispatch,
  onClose,
}: {
  scene: SceneName
  appearance: RoomAppearance
  dispatch: (action: EditorAction) => void
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  const close = () => {
    dialog.current?.close()
    onClose()
  }
  const change = (patch: Partial<RoomAppearance>) =>
    dispatch({ type: 'appearance', appearance: { ...appearance, ...patch } })
  const original = defaultAppearance(scene)
  const changed =
    original.wall !== appearance.wall || original.floor !== appearance.floor
  return (
    <dialog
      ref={dialog}
      className="environment-dialog"
      aria-labelledby="environment-title"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
    >
      <header>
        <div>
          <h2 id="environment-title">Ambiente</h2>
          <p>Escolha os acabamentos do seu quarto.</p>
        </div>
        <button autoFocus aria-label="Fechar ambiente" onClick={close}>
          <X size={20} aria-hidden="true" />
        </button>
      </header>
      <div className="environment-options">
        <fieldset className="wall-finishes">
          <legend>Paredes</legend>
          <div>
            {wallPaints.map((paint) => (
              <button
                key={paint.color}
                aria-label={`Parede ${paint.name}`}
                aria-pressed={appearance.wall === paint.color}
                onClick={() => change({ wall: paint.color })}
              >
                <span
                  className="paint-sample"
                  style={{ backgroundColor: paint.color }}
                >
                  {appearance.wall === paint.color && (
                    <Check size={17} aria-hidden="true" />
                  )}
                </span>
                <span>{paint.name}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="floor-finishes">
          <legend>Piso</legend>
          <div>
            {Object.entries(floors).map(([id, floor]) => (
              <button
                key={id}
                aria-label={`Piso ${floor.name}`}
                aria-pressed={appearance.floor === id}
                onClick={() => change({ floor: id as RoomAppearance['floor'] })}
              >
                <span
                  className={`floor-sample ${id === 'stone' ? 'floor-sample-stone' : ''}`}
                  style={{ backgroundColor: floor.plan, color: floor.line }}
                >
                  {appearance.floor === id && (
                    <Check size={17} aria-hidden="true" />
                  )}
                </span>
                <span>{floor.name}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <p className="environment-note">
        Os acabamentos entram no salvamento e no link. Use Desfazer para voltar.
      </p>
      <footer>
        <button
          disabled={!changed}
          onClick={() => dispatch({ type: 'appearance', appearance: original })}
        >
          Restaurar ambiente
        </button>
        <button className="button button-small button-primary" onClick={close}>
          Concluir
        </button>
      </footer>
    </dialog>
  )
}
