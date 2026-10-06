import { useEffect, useRef } from 'react'

export function ConfirmDialog({
  title,
  children,
  confirm,
  onConfirm,
  onCancel,
}: {
  title: string
  children: React.ReactNode
  confirm: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
  }, [])
  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
    >
      <h2 id="confirm-title">{title}</h2>
      <p>{children}</p>
      <div className="dialog-actions">
        <button className="button" autoFocus onClick={onCancel}>
          Cancelar
        </button>
        <button className="button button-primary" onClick={onConfirm}>
          {confirm}
        </button>
      </div>
    </dialog>
  )
}
