import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Copy, Plus, Trash2 } from 'lucide-react'
import { Brand } from '../components/Brand'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { RoomScene } from '../features/editor/RoomScene'
import {
  deleteSetup,
  readSetups,
  saveSetup,
  storageMessage,
  STORAGE_KEY,
  MAX_SETUPS,
} from '../features/setups/storage'
import type { SavedSetup } from '../features/setups/storage'
import { importJson } from '../features/setups/export'

export function Setups() {
  const [initial] = useState(() => {
    try {
      return { setups: readSetups(window.localStorage), error: '' }
    } catch (error) {
      return { setups: [], error: storageMessage(error) }
    }
  })
  const [setups, setSetups] = useState<SavedSetup[]>(initial.setups)
  const [error, setError] = useState(initial.error)
  const [message, setMessage] = useState('')
  const [pendingDelete, setPendingDelete] = useState<SavedSetup | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const load = useCallback(() => {
    try {
      setSetups(readSetups(window.localStorage))
      setError('')
    } catch (error) {
      setError(storageMessage(error))
    }
  }, [])
  const importFile = async (file: File) => {
    setImporting(true)
    setMessage('')
    try {
      const setup = await importJson(file)
      const now = new Date().toISOString()
      saveSetup(
        window.localStorage,
        {
          ...setup,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
          revision: crypto.randomUUID(),
        },
        null,
      )
      load()
      setMessage(`${setup.name} importado como novo setup.`)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível importar. Escolha um arquivo RoomLab válido.',
      )
    } finally {
      setImporting(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) load()
    }
    const visible = () => {
      if (document.visibilityState === 'visible') load()
    }
    window.addEventListener('storage', sync)
    document.addEventListener('visibilitychange', visible)
    return () => {
      window.removeEventListener('storage', sync)
      document.removeEventListener('visibilitychange', visible)
    }
  }, [load])
  const duplicate = (setup: SavedSetup) => {
    try {
      const now = new Date().toISOString()
      saveSetup(
        window.localStorage,
        {
          ...setup,
          id: crypto.randomUUID(),
          name: `${setup.name.slice(0, 52)} (cópia)`,
          createdAt: now,
          updatedAt: now,
          revision: crypto.randomUUID(),
        },
        null,
      )
      load()
      setMessage(`Cópia de ${setup.name} salva.`)
    } catch (error) {
      setError(storageMessage(error))
    }
  }
  const remove = () => {
    if (!pendingDelete) return
    try {
      deleteSetup(window.localStorage, pendingDelete.id, pendingDelete.revision)
      load()
      setMessage(`${pendingDelete.name} excluído.`)
    } catch (error) {
      setError(storageMessage(error))
    }
    setPendingDelete(null)
  }
  return (
    <>
      <header className="home-header">
        <Brand />
        <Link to="/" className="back-home">
          <ArrowLeft size={16} aria-hidden="true" />
          Início
        </Link>
      </header>
      <main id="main-content" className="setups-page">
        <div className="setups-heading">
          <div>
            <h1>Meus setups</h1>
            <p>Suas ideias guardadas para a próxima visita.</p>
          </div>
          <div className="setups-actions">
            <button
              className="button"
              disabled={importing}
              onClick={() => fileInput.current?.click()}
            >
              {importing ? 'Importando…' : 'Importar JSON'}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              hidden
              aria-label="Arquivo do setup"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void importFile(file)
              }}
            />
            <Link className="button button-primary" to="/editor?scene=empty">
              <Plus size={18} aria-hidden="true" />
              Novo setup
            </Link>
          </div>
        </div>
        <div className="local-storage-note">
          <span>
            {setups.length}/{MAX_SETUPS} setups
          </span>
          <p>
            Salvos apenas neste navegador. Limpar os dados do site também exclui
            seus setups.
          </p>
        </div>
        {error && (
          <div className="save-feedback save-error" role="alert">
            <p>{error}</p>
            <button className="button button-small" onClick={load}>
              Atualizar lista
            </button>
          </div>
        )}
        <p className="save-feedback" role="status">
          {message}
        </p>
        {!error && !setups.length && (
          <section className="setups-empty">
            <div className="empty-setup-art">
              <RoomScene scene="empty" />
            </div>
            <div>
              <h2>Seu primeiro quarto começa aqui.</h2>
              <p>
                Monte uma composição, dê um nome e salve. Ela aparece nesta
                lista para você continuar depois.
              </p>
              <Link className="button" to="/editor?scene=empty">
                Montar meu primeiro setup
              </Link>
            </div>
          </section>
        )}
        <div className="saved-setups-grid">
          {[...setups]
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .map((setup) => (
              <article className="saved-setup" key={setup.id}>
                <Link
                  className="saved-setup-preview"
                  to={`/editor?setup=${encodeURIComponent(setup.id)}`}
                  aria-label={`Abrir ${setup.name}`}
                >
                  <RoomScene scene={setup.scene} objects={setup.objects} />
                </Link>
                <div className="saved-setup-details">
                  <h2>
                    <Link to={`/editor?setup=${encodeURIComponent(setup.id)}`}>
                      {setup.name}
                    </Link>
                  </h2>
                  <p>
                    {setup.objects.length}{' '}
                    {setup.objects.length === 1 ? 'objeto' : 'objetos'}
                  </p>
                  <p>
                    Salvo em{' '}
                    <time dateTime={setup.updatedAt}>
                      {new Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(setup.updatedAt))}
                    </time>
                  </p>
                  <div className="saved-setup-actions">
                    <button
                      onClick={() => duplicate(setup)}
                      disabled={setups.length >= MAX_SETUPS}
                      aria-label={`Duplicar ${setup.name}`}
                    >
                      <Copy size={16} aria-hidden="true" />
                      Duplicar
                    </button>
                    <button
                      onClick={() => setPendingDelete(setup)}
                      aria-label={`Excluir ${setup.name}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </main>
      {pendingDelete && (
        <ConfirmDialog
          title="Excluir este setup?"
          confirm="Excluir setup"
          onCancel={() => setPendingDelete(null)}
          onConfirm={remove}
        >
          O setup “{pendingDelete.name}” será excluído deste navegador. Essa
          ação não pode ser desfeita.
        </ConfirmDialog>
      )}
    </>
  )
}
