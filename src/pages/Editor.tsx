import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  Search,
  SlidersHorizontal,
  Armchair,
  Info,
  ArrowLeft,
  Check,
  Minus,
  Plus,
  Scan,
  Undo2,
  Redo2,
  Grid2X2,
} from 'lucide-react'
import { Brand } from '../components/Brand'
import { catalog, categories, findItem } from '../features/catalog/catalog'
import type { Category, ObjectKind } from '../features/catalog/catalog'
import { ObjectThumbnail } from '../features/catalog/ObjectArt'
import { RoomScene } from '../features/editor/RoomScene'
import { ObjectProperties } from '../features/editor/ObjectProperties'
import { useRoomEditor } from '../features/editor/useRoomEditor'
import { MAX_OBJECTS } from '../features/editor/editorModel'
import { moveObject } from '../features/editor/geometry'
import type { SceneName, SceneObject } from '../features/editor/scenes'

export function Editor() {
  const [params] = useSearchParams()
  const rawScene = params.get('scene')
  const scene: SceneName =
    rawScene === 'dual' || rawScene === 'plants' || rawScene === 'empty'
      ? rawScene
      : 'study'
  return <EditorWorkspace key={scene} scene={scene} />
}

function EditorWorkspace({ scene }: { scene: SceneName }) {
  const editor = useRoomEditor(scene)
  const {
    state,
    selectedObject,
    select,
    add,
    update,
    remove,
    duplicate,
    dispatch,
  } = editor
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('Todos')
  const [panel, setPanel] = useState<'catalog' | 'properties'>('catalog')
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(false)
  const propertiesHeading = useRef<HTMLHeadingElement>(null)
  const objects = state.objects
  const canAdd = objects.length < MAX_OBJECTS
  const isDragging = !!state.gestureStart
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const filtered = catalog.filter(
    (item) =>
      (category === 'Todos' || item.category === category) &&
      normalize(item.name).includes(normalize(query)),
  )
  const showProperties = (focus = true) => {
    setPanel('properties')
    if (focus && window.matchMedia('(max-width: 900px)').matches)
      requestAnimationFrame(() => propertiesHeading.current?.focus())
  }
  const selectObject = (object: SceneObject, reveal = true) => {
    select(object.id)
    showProperties(reveal)
  }
  const addObject = (kind: ObjectKind, point?: { x: number; y: number }) => {
    add(kind, point)
    if (canAdd) showProperties()
  }
  const handleKeyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (
      (event.target as Element).closest(
        'input, textarea, select, [contenteditable="true"]',
      ) ||
      isDragging
    )
      return
    const modifier = event.ctrlKey || event.metaKey
    const key = event.key.toLowerCase()
    if (modifier && key === 'z') {
      event.preventDefault()
      dispatch({ type: event.shiftKey ? 'redo' : 'undo' })
      return
    }
    if (modifier && key === 'y') {
      event.preventDefault()
      dispatch({ type: 'redo' })
      return
    }
    if (modifier && key === 'd') {
      event.preventDefault()
      duplicate()
      return
    }
    if (event.key === 'Escape') {
      select(null)
      return
    }
    if (!selectedObject || modifier || event.altKey) return
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      remove()
      requestAnimationFrame(() => propertiesHeading.current?.focus())
      return
    }
    const step = event.shiftKey ? 10 : 2
    const deltas: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    const delta = deltas[event.key]
    if (delta) {
      event.preventDefault()
      update(
        moveObject(
          selectedObject,
          selectedObject.x + delta[0],
          selectedObject.y + delta[1],
          false,
        ),
      )
    }
  }

  return (
    <div className="editor-page" onKeyDown={handleKeyboard}>
      <header className="editor-header">
        <Brand />
        <div className="project-name">
          <span>
            {scene === 'empty'
              ? 'Meu novo quarto'
              : scene === 'dual'
                ? 'Setup com dois monitores'
                : scene === 'plants'
                  ? 'Cantinho com plantas'
                  : 'Mesa para estudar'}
          </span>
          <span className="demo-badge">Não salvo</span>
        </div>
        <Link to="/" className="back-home">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Voltar</span>
        </Link>
      </header>
      <main id="main-content" className="editor-main">
        <div className="editor-notice">
          <Info size={17} aria-hidden="true" />
          <p>
            Seu quarto já pode ser editado.{' '}
            <span>
              As alterações ficam nesta sessão. O salvamento chega na próxima
              entrega.
            </span>
          </p>
        </div>
        <p className="sr-only" role="status">
          {editor.message}
        </p>
        <div className="workspace">
          <aside
            className={`catalog-panel ${panel === 'catalog' ? 'mobile-active' : ''}`}
            aria-labelledby="catalog-heading"
          >
            <div className="panel-heading">
              <h1 id="catalog-heading">Objetos</h1>
              <span>
                {objects.length}/{MAX_OBJECTS} no quarto
              </span>
            </div>
            <p className="panel-description">
              Clique para adicionar ou arraste uma peça até o quarto.
            </p>
            <label className="search-field">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Buscar objetos</span>
              <input
                type="search"
                placeholder="Buscar um objeto"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="category-options" aria-label="Filtrar categoria">
              {categories.map((value) => (
                <button
                  key={value}
                  aria-pressed={category === value}
                  onClick={() => setCategory(value)}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="catalog-grid">
              {filtered.map((object) => (
                <button
                  className="catalog-item"
                  key={object.id}
                  aria-label={`Adicionar ${object.name.toLowerCase()}`}
                  disabled={!canAdd || isDragging}
                  draggable={canAdd}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      'application/roomlab-object',
                      object.id,
                    )
                    event.dataTransfer.effectAllowed = 'copy'
                  }}
                  onClick={() => addObject(object.id)}
                >
                  <ObjectThumbnail kind={object.id} color={object.color} />
                  <span>{object.name}</span>
                  <span className="catalog-add">
                    <Plus size={12} aria-hidden="true" />
                    Adicionar
                  </span>
                </button>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="catalog-empty">
                <p>Nenhum objeto encontrado.</p>
                <button
                  className="text-link"
                  onClick={() => {
                    setQuery('')
                    setCategory('Todos')
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
            <p className="catalog-footnote">
              No celular, toque na peça para adicioná-la. Você pode desfazer
              qualquer edição.
            </p>
            {!canAdd && (
              <p className="limit-notice">
                Limite de {MAX_OBJECTS} objetos atingido. Exclua uma peça para
                continuar.
              </p>
            )}
          </aside>
          <section className="scene-panel" aria-label="Editor do quarto">
            <div className="scene-heading">
              <span>Seu quarto</span>
              <span>
                {objects.length} {objects.length === 1 ? 'objeto' : 'objetos'}
              </span>
            </div>
            <div className="scene-viewport">
              <div
                className="zoomed-scene"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <RoomScene
                  scene={scene}
                  objects={objects}
                  selected={selectedObject?.id}
                  onSelect={selectObject}
                  onDeselect={() => select(null)}
                  onEdit={dispatch}
                  onDropObject={(kind, point) => {
                    if (catalog.some((item) => item.id === kind))
                      addObject(kind as ObjectKind, point)
                  }}
                  showGrid={showGrid}
                  showMeasurements
                />
              </div>
              {objects.length === 0 && (
                <div className="empty-room-message">
                  <Armchair size={30} aria-hidden="true" />
                  <h2>Espaço para suas ideias.</h2>
                  <p>Comece adicionando uma mesa pelo catálogo.</p>
                  <button
                    className="button button-small"
                    onClick={() => addObject('desk')}
                  >
                    Adicionar mesa
                  </button>
                </div>
              )}
            </div>
            <div className="scene-toolbar">
              <div className="editor-tools">
                <button
                  aria-label="Desfazer"
                  title="Desfazer (Ctrl ou Cmd + Z)"
                  disabled={!state.past.length || isDragging}
                  onClick={() => dispatch({ type: 'undo' })}
                >
                  <Undo2 size={18} aria-hidden="true" />
                </button>
                <button
                  aria-label="Refazer"
                  title="Refazer (Ctrl ou Cmd + Shift + Z)"
                  disabled={!state.future.length || isDragging}
                  onClick={() => dispatch({ type: 'redo' })}
                >
                  <Redo2 size={18} aria-hidden="true" />
                </button>
                <button
                  className="grid-toggle"
                  aria-pressed={showGrid}
                  disabled={isDragging}
                  onClick={() => setShowGrid((value) => !value)}
                >
                  <Grid2X2 size={17} aria-hidden="true" />
                  Grade
                </button>
              </div>
              <div className="zoom-controls">
                <button
                  aria-label="Diminuir zoom"
                  disabled={zoom <= 80 || isDragging}
                  onClick={() => setZoom((value) => value - 10)}
                >
                  <Minus size={17} aria-hidden="true" />
                </button>
                <output aria-live="polite" aria-label="Zoom">
                  {zoom}%
                </output>
                <button
                  aria-label="Aumentar zoom"
                  disabled={zoom >= 130 || isDragging}
                  onClick={() => setZoom((value) => value + 10)}
                >
                  <Plus size={17} aria-hidden="true" />
                </button>
                <button
                  aria-label="Ajustar quarto à tela"
                  disabled={isDragging}
                  onClick={() => setZoom(100)}
                >
                  <Scan size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
            <p className="scene-hint">
              Arraste para mover. Use o canto azul para redimensionar. Setas
              movem a seleção; Shift aumenta o passo.
            </p>
            <p className="grid-note">
              {showGrid
                ? 'Grade ativa: o arrasto se ajusta a cada 10 unidades.'
                : 'Movimento livre. Ative a grade para alinhar as peças.'}
            </p>
          </section>
          <div className="mobile-panel-switch" aria-label="Painel do editor">
            <button
              aria-pressed={panel === 'catalog'}
              onClick={() => setPanel('catalog')}
              onPointerUp={(event) => {
                if (event.pointerType === 'touch') setPanel('catalog')
              }}
            >
              <Armchair size={18} aria-hidden="true" />
              Catálogo
            </button>
            <button
              aria-pressed={panel === 'properties'}
              onClick={() => setPanel('properties')}
              onPointerUp={(event) => {
                if (event.pointerType === 'touch') setPanel('properties')
              }}
            >
              <SlidersHorizontal size={18} aria-hidden="true" />
              Propriedades
            </button>
          </div>
          <aside
            className={`properties-panel ${panel === 'properties' ? 'mobile-active' : ''}`}
            aria-labelledby="properties-heading"
          >
            <div className="panel-heading">
              <h2 id="properties-heading" ref={propertiesHeading} tabIndex={-1}>
                Propriedades
              </h2>
              <SlidersHorizontal size={17} aria-hidden="true" />
            </div>
            {selectedObject ? (
              <ObjectProperties
                object={selectedObject}
                update={update}
                duplicate={duplicate}
                remove={() => {
                  remove()
                  requestAnimationFrame(() =>
                    propertiesHeading.current?.focus(),
                  )
                }}
                dispatch={dispatch}
                canDuplicate={canAdd}
              />
            ) : (
              <div className="no-selection">
                <SlidersHorizontal size={26} aria-hidden="true" />
                <p>Selecione uma peça no quarto ou na lista para editá-la.</p>
              </div>
            )}
            <div className="object-list">
              <h3>
                No seu quarto <span>{objects.length}</span>
              </h3>
              {objects.length ? (
                objects
                  .slice()
                  .reverse()
                  .map((object) => (
                    <button
                      key={object.id}
                      aria-label={`Editar ${findItem(object.kind).name.toLowerCase()} na lista`}
                      aria-pressed={selectedObject?.id === object.id}
                      onClick={() => selectObject(object)}
                    >
                      <ObjectThumbnail
                        kind={object.kind}
                        color={object.color}
                      />
                      <span>{findItem(object.kind).name}</span>
                      {selectedObject?.id === object.id && (
                        <Check size={15} aria-hidden="true" />
                      )}
                    </button>
                  ))
              ) : (
                <p>Seu quarto ainda está vazio.</p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
