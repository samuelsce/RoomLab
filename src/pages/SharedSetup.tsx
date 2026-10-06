import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowLeft, Copy, Download } from 'lucide-react'
import { Brand } from '../components/Brand'
import { RoomScene } from '../features/editor/RoomScene'
import { RoomPreview } from '../features/room3d/RoomPreview'
import { decodeSharedDocument } from '../features/sharing/codec'
import type { SharedDocument } from '../features/sharing/document'
import { saveSetup, storageMessage } from '../features/setups/storage'
import { exportJson } from '../features/setups/export'

export function SharedSetup() {
  const location = useLocation()
  const token =
    new URLSearchParams(location.search).get('data') ??
    new URLSearchParams(location.hash.slice(1)).get('data') ??
    ''
  return <SharedViewer key={token} token={token} />
}
function SharedViewer({ token }: { token: string }) {
  const [document, setDocument] = useState<SharedDocument | null>(null)
  const [error, setError] = useState('')
  const [copyError, setCopyError] = useState('')
  const [message, setMessage] = useState('')
  const [view, setView] = useState<'plan' | '3d'>('3d')
  const navigate = useNavigate()
  useEffect(() => {
    let active = true
    void decodeSharedDocument(token).then(
      (document) => {
        if (active) setDocument(document)
      },
      (error: unknown) => {
        if (active)
          setError(
            error instanceof Error
              ? error.message
              : 'Não foi possível abrir o quarto.',
          )
      },
    )
    return () => {
      active = false
    }
  }, [token])
  const localCopy = () => {
    if (!document) return
    const now = new Date().toISOString()
    return {
      ...document,
      id: crypto.randomUUID(),
      revision: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
  }
  const editCopy = () => {
    const copy = localCopy()
    if (!copy) return
    try {
      const setup = saveSetup(window.localStorage, copy, null)
      void navigate(`/editor?setup=${encodeURIComponent(setup.id)}`)
    } catch (error) {
      setCopyError(storageMessage(error))
    }
  }
  const backup = () => {
    const copy = localCopy()
    if (copy) {
      exportJson(copy)
      setMessage('Backup JSON gerado para download.')
    }
  }
  return (
    <>
      <header className="home-header">
        <Brand />
        <Link className="back-home" to="/">
          <ArrowLeft size={16} aria-hidden="true" />
          Início
        </Link>
      </header>
      <main id="main-content" className="shared-page" tabIndex={-1}>
        {error ? (
          <div className="shared-error">
            <h1>Não foi possível abrir este quarto.</h1>
            <p role="alert">{error}</p>
            <Link className="button button-primary" to="/editor?scene=empty">
              Montar meu setup
            </Link>
          </div>
        ) : !document ? (
          <div className="shared-loading" role="status">
            <h1>Abrindo o quarto…</h1>
            <p>Preparando a composição compartilhada.</p>
          </div>
        ) : (
          <>
            <div className="shared-heading">
              <div>
                <h1>{document.name}</h1>
                <p>
                  {document.objects.length}{' '}
                  {document.objects.length === 1 ? 'objeto' : 'objetos'} nesta
                  composição
                </p>
              </div>
              <button className="button button-primary" onClick={editCopy}>
                <Copy size={18} aria-hidden="true" />
                Editar uma cópia
              </button>
            </div>
            <div className="shared-room">
              <div
                className="shared-view-switch view-switch"
                aria-label="Vista do quarto"
              >
                <button
                  aria-pressed={view === 'plan'}
                  onClick={() => setView('plan')}
                >
                  Planta 2D
                </button>
                <button
                  aria-pressed={view === '3d'}
                  onClick={() => setView('3d')}
                >
                  Ver em 3D
                </button>
              </div>
              {view === '3d' ? (
                <RoomPreview
                  scene={document.scene}
                  objects={document.objects}
                />
              ) : (
                <RoomScene scene={document.scene} objects={document.objects} />
              )}
            </div>
            <div className="shared-bottom">
              <p>
                Esta é a versão guardada no link. Crie uma cópia para
                experimentar suas ideias sem alterar o original.
              </p>
              <button className="button button-small" onClick={backup}>
                <Download size={17} aria-hidden="true" />
                Exportar JSON
              </button>
            </div>
            {copyError && (
              <p className="save-feedback save-error" role="alert">
                {copyError}
              </p>
            )}
            <p className="save-feedback" role="status">
              {message}
            </p>
          </>
        )}
      </main>
    </>
  )
}
