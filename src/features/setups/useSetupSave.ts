import { useEffect, useRef, useState } from 'react'
import { useBlocker, useNavigate } from 'react-router'
import type { SceneName, SceneObject } from '../editor/scenes'
import { saveSetup, storageMessage } from './storage'
import type { SavedSetup } from './storage'

const names: Record<SceneName, string> = {
  empty: 'Meu novo quarto',
  dual: 'Setup com dois monitores',
  plants: 'Cantinho com plantas',
  study: 'Mesa para estudar',
}
const snapshot = (name: string, objects: SceneObject[]) =>
  JSON.stringify({ name: name.trim(), objects })

export function useSetupSave(
  scene: SceneName,
  objects: SceneObject[],
  initial: SavedSetup | undefined,
  workspaceKey: string,
) {
  const [saved, setSaved] = useState(initial)
  const [name, setName] = useState(initial?.name ?? names[scene])
  const [baseline, setBaseline] = useState(() =>
    snapshot(initial?.name ?? names[scene], objects),
  )
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const dirty = snapshot(name, objects) !== baseline
  const navigate = useNavigate()
  const savingNavigation = useRef(false)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty &&
      !savingNavigation.current &&
      (currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search),
  )
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const save = (copy = false) => {
    setError('')
    setFeedback('')
    const cleanName = name.trim()
    if (!cleanName || cleanName.length > 60) {
      setError('Dê um nome ao setup, com até 60 caracteres.')
      return false
    }
    const now = new Date().toISOString()
    try {
      const setup = saveSetup(
        window.localStorage,
        {
          id: copy || !saved ? crypto.randomUUID() : saved.id,
          name: cleanName,
          scene,
          objects,
          createdAt: copy || !saved ? now : saved.createdAt,
          updatedAt: now,
          revision: crypto.randomUUID(),
        },
        copy ? null : (saved?.revision ?? null),
      )
      setSaved(setup)
      setName(cleanName)
      setBaseline(snapshot(cleanName, objects))
      setFeedback(
        copy ? 'Cópia salva neste navegador.' : 'Setup salvo neste navegador.',
      )
      savingNavigation.current = true
      void navigate(`/editor?setup=${encodeURIComponent(setup.id)}`, {
        replace: true,
        state: { workspaceKey },
      })
      queueMicrotask(() => {
        savingNavigation.current = false
      })
      return true
    } catch (error) {
      setError(storageMessage(error))
      return false
    }
  }
  return { name, setName, saved, dirty, save, feedback, error, blocker }
}
