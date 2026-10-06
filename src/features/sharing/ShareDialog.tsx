import { useEffect, useRef, useState } from 'react'
import { Check, Copy, ExternalLink, X } from 'lucide-react'
import { buildShareUrl, encodeSharedDocument } from './codec'
import type { SharedDocument } from './document'

export function ShareDialog({
  document,
  onClose,
}: {
  document: SharedDocument
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')
  useEffect(() => {
    dialog.current?.showModal()
  }, [])
  const close = () => {
    dialog.current?.close()
    onClose()
  }
  const generate = async () => {
    setPending(true)
    setError('')
    try {
      const token = await encodeSharedDocument(document)
      setUrl(
        buildShareUrl(
          token,
          window.location.origin,
          import.meta.env.BASE_URL,
          import.meta.env.VITE_ROUTER_MODE === 'hash',
        ),
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível gerar o link. Tente novamente.',
      )
    } finally {
      setPending(false)
    }
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setCopyMessage('Link copiado.')
    } catch {
      input.current?.focus()
      input.current?.select()
      setCopyMessage(
        'Selecione e copie o endereço do campo abaixo. O navegador não permitiu a cópia automática.',
      )
    }
  }
  return (
    <dialog
      className="share-dialog"
      ref={dialog}
      aria-labelledby="share-title"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
    >
      <div className="share-dialog-heading">
        <h2 id="share-title">Compartilhar quarto</h2>
        <button
          className="icon-button"
          aria-label="Fechar compartilhamento"
          autoFocus
          onClick={close}
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <p>
        Quem tiver o link poderá ver o nome e a composição deste quarto, sem
        cadastro.
      </p>
      <div className="snapshot-note">
        <strong>{document.name || 'Seu quarto'}</strong>
        <span>{document.objects.length} objetos nesta versão</span>
      </div>
      <p>
        O link guarda uma cópia fixa. Edições feitas depois não alteram essa
        versão. Para compartilhá-las, gere outro link.
      </p>
      {import.meta.env.DEV && (
        <p className="local-share-note">
          Na prévia local, o endereço funciona somente neste computador. No
          GitHub Pages, poderá ser aberto em outro dispositivo.
        </p>
      )}
      {!url && (
        <button
          className="button button-primary"
          disabled={pending}
          onClick={() => void generate()}
        >
          {pending ? 'Gerando link…' : 'Gerar link'}
        </button>
      )}
      {error && (
        <p className="share-error" role="alert">
          {error}
        </p>
      )}
      {url && (
        <div className="share-result">
          <label htmlFor="share-url">Link do quarto</label>
          <input
            ref={input}
            id="share-url"
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
          />
          <div className="share-result-actions">
            <button
              className="button button-primary"
              onClick={() => void copy()}
            >
              {copied ? (
                <Check size={17} aria-hidden="true" />
              ) : (
                <Copy size={17} aria-hidden="true" />
              )}
              {copied ? 'Copiado' : 'Copiar link'}
            </button>
            <a className="button" href={url} target="_blank" rel="noreferrer">
              Abrir link
              <ExternalLink size={16} aria-hidden="true" />
              <span className="sr-only"> (abre em outra aba)</span>
            </a>
          </div>
          <p role="status">
            {copyMessage ||
              'Link gerado. Copie o endereço inteiro para compartilhar.'}
          </p>
        </div>
      )}
    </dialog>
  )
}
