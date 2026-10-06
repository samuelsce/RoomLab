import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import {
  Search,
  SlidersHorizontal,
  Armchair,
  Eye,
  ArrowLeft,
  Check,
  Minus,
  Plus,
  Scan,
} from 'lucide-react'
import { Brand } from '../components/Brand'
import { catalog, categories, findItem } from '../features/catalog/catalog'
import type { Category, CatalogItem } from '../features/catalog/catalog'
import { ObjectThumbnail } from '../features/catalog/ObjectArt'
import { RoomScene } from '../features/editor/RoomScene'
import { getSceneObjects } from '../features/editor/scenes'
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
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('Todos')
  const [panel, setPanel] = useState<'catalog' | 'properties'>('catalog')
  const [selected, setSelected] = useState<string | null>(
    scene === 'empty' ? null : 'desk',
  )
  const [preview, setPreview] = useState<CatalogItem | null>(null)
  const [zoom, setZoom] = useState(100)
  const propertiesHeading = useRef<HTMLHeadingElement>(null)
  const focusMobileProperties = () => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      requestAnimationFrame(() => propertiesHeading.current?.focus())
    }
  }
  const objects = getSceneObjects(scene)
  const selectedObject = objects.find((object) => object.id === selected)
  const item =
    preview ??
    (selectedObject
      ? { ...findItem(selectedObject.kind), color: selectedObject.color }
      : null)
  const normalizedQuery = query
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const filtered = catalog.filter(
    (item) =>
      (category === 'Todos' || item.category === category) &&
      item.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(normalizedQuery),
  )
  const selectObject = (object: SceneObject) => {
    setSelected(object.id)
    setPreview(null)
    setPanel('properties')
    focusMobileProperties()
  }

  return (
    <div className="editor-page">
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
          <span className="demo-badge">Demonstração</span>
        </div>
        <Link to="/" className="back-home">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Voltar</span>
        </Link>
      </header>
      <main id="main-content" className="editor-main">
        <div className="editor-notice">
          <Eye size={17} aria-hidden="true" />
          <p>
            Explore o catálogo e selecione os objetos.{' '}
            <span>
              Mover, personalizar e salvar estarão disponíveis nas próximas
              etapas.
            </span>
          </p>
        </div>
        <div className="workspace">
          <aside
            className={`catalog-panel ${panel === 'catalog' ? 'mobile-active' : ''}`}
            aria-labelledby="catalog-heading"
          >
            <div className="panel-heading">
              <h1 id="catalog-heading">Objetos</h1>
              <span>{catalog.length} peças</span>
            </div>
            <p className="panel-description">
              Explore as peças para o seu quarto.
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
                  className={`catalog-item ${preview?.id === object.id ? 'is-preview' : ''}`}
                  key={object.id}
                  aria-label={`Ver detalhes: ${object.name}`}
                  aria-pressed={preview?.id === object.id}
                  onClick={() => {
                    setPreview(object)
                    setSelected(null)
                    setPanel('properties')
                    focusMobileProperties()
                  }}
                >
                  <ObjectThumbnail kind={object.id} color={object.color} />
                  <span>{object.name}</span>
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
              Selecione uma peça para ver seus detalhes. Adicionar ao quarto
              será a próxima entrega.
            </p>
          </aside>
          <section className="scene-panel" aria-label="Prévia do quarto">
            <div className="scene-heading">
              <span>Seu quarto</span>
              <span>3,60 × 2,80 m</span>
            </div>
            <div className="scene-viewport">
              <div
                className="zoomed-scene"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <RoomScene
                  scene={scene}
                  selected={selected}
                  onSelect={selectObject}
                  showMeasurements
                />
              </div>
              {scene === 'empty' && (
                <div className="empty-room-message">
                  <Armchair size={30} aria-hidden="true" />
                  <h2>Espaço para suas ideias.</h2>
                  <p>
                    Conheça as peças no catálogo ou explore um quarto pronto.
                  </p>
                  <Link
                    className="button button-small"
                    to="/editor?scene=study"
                  >
                    Usar quarto de exemplo
                  </Link>
                </div>
              )}
            </div>
            <div className="scene-toolbar">
              <span>
                <i />
                Vista superior
              </span>
              <div className="zoom-controls">
                <button
                  aria-label="Diminuir zoom"
                  disabled={zoom <= 80}
                  onClick={() => setZoom((value) => value - 10)}
                >
                  <Minus size={17} />
                </button>
                <output aria-live="polite" aria-label="Zoom">
                  {zoom}%
                </output>
                <button
                  aria-label="Aumentar zoom"
                  disabled={zoom >= 130}
                  onClick={() => setZoom((value) => value + 10)}
                >
                  <Plus size={17} />
                </button>
                <button
                  aria-label="Restaurar zoom"
                  onClick={() => setZoom(100)}
                >
                  <Scan size={17} />
                </button>
              </div>
            </div>
            <p className="scene-hint">
              {objects.length
                ? 'Clique em uma peça ou use a lista de objetos para selecioná-la.'
                : 'O quarto vazio é uma prévia. Nenhuma alteração é salva nesta versão.'}
            </p>
          </section>
          <div className="mobile-panel-switch" aria-label="Painel do editor">
            <button
              aria-pressed={panel === 'catalog'}
              onClick={() => setPanel('catalog')}
            >
              <Armchair size={18} aria-hidden="true" />
              Catálogo
            </button>
            <button
              aria-pressed={panel === 'properties'}
              onClick={() => setPanel('properties')}
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
            {item ? (
              <>
                <div className="selected-preview">
                  <ObjectThumbnail kind={item.id} color={item.color} />
                </div>
                <span className="preview-source">
                  {preview ? 'Prévia do catálogo' : 'Objeto no quarto'}
                </span>
                <h3 className="selected-name">{item.name}</h3>
                <p className="selected-description">{item.description}</p>
                <dl className="object-details">
                  <div>
                    <dt>Categoria</dt>
                    <dd>{item.category}</dd>
                  </div>
                  <div>
                    <dt>Dimensões sugeridas</dt>
                    <dd>{item.dimensions}</dd>
                  </div>
                  <div>
                    <dt>Material / cor</dt>
                    <dd>
                      <span
                        className="color-dot"
                        style={{ background: item.color }}
                      />
                      {item.id === 'desk' ||
                      item.id === 'shelf' ||
                      item.id === 'round-desk'
                        ? 'Madeira'
                        : item.id === 'plant'
                          ? 'Verde'
                          : item.id === 'rug'
                            ? item.color === '#99ae95'
                              ? 'Verde suave'
                              : 'Azul suave'
                            : item.id === 'lamp' || item.id === 'frame'
                              ? 'Mostarda'
                              : item.id === 'keyboard'
                                ? 'Marfim'
                                : 'Grafite'}
                    </dd>
                  </div>
                </dl>
                <p className="properties-note">
                  Dimensões ilustrativas. A edição de tamanho e cor chega nas
                  próximas etapas.
                </p>
              </>
            ) : (
              <div className="no-selection">
                <SlidersHorizontal size={26} aria-hidden="true" />
                <p>Selecione uma peça para conhecer seus detalhes.</p>
              </div>
            )}
            <div className="object-list">
              <h3>
                No seu quarto <span>{objects.length}</span>
              </h3>
              {objects.length ? (
                objects.map((object) => (
                  <button
                    key={object.id}
                    aria-pressed={selected === object.id}
                    onClick={() => selectObject(object)}
                  >
                    <ObjectThumbnail kind={object.kind} color={object.color} />
                    <span>{findItem(object.kind).name}</span>
                    {selected === object.id && (
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
