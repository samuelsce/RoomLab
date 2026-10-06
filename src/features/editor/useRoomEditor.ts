import { useReducer, useState } from 'react'
import { catalog } from '../catalog/catalog'
import type { ObjectKind } from '../catalog/catalog'
import {
  createEditorState,
  createObject,
  editorReducer,
  MAX_OBJECTS,
} from './editorModel'
import { getSceneObjects } from './scenes'
import type { SceneName, SceneObject } from './scenes'
import { defaultAppearance } from './appearance'
import type { RoomAppearance } from './appearance'
import { detach } from './surfaces'

export function useRoomEditor(
  scene: SceneName,
  initialObjects?: SceneObject[],
  initialAppearance?: RoomAppearance,
) {
  const [state, dispatch] = useReducer(
    editorReducer,
    initialObjects ?? getSceneObjects(scene),
    (objects) =>
      createEditorState(objects, initialAppearance ?? defaultAppearance(scene)),
  )
  const [selectedId, select] = useState<string | null>(
    scene === 'empty' ? null : 'desk',
  )
  const [message, setMessage] = useState('')
  const selectedObject = state.objects.find(
    (object) => object.id === selectedId,
  )
  const add = (kind: ObjectKind, point?: { x: number; y: number }) => {
    if (state.objects.length >= MAX_OBJECTS) {
      setMessage(
        `Seu quarto já tem ${MAX_OBJECTS} objetos. Exclua uma peça para adicionar outra.`,
      )
      return
    }
    const object = createObject(
      kind,
      crypto.randomUUID(),
      state.objects.length,
      point,
    )
    dispatch({ type: 'add', object })
    select(object.id)
    setMessage(
      `${catalog.find((item) => item.id === kind)!.name} adicionado ao quarto.`,
    )
  }
  const update = (patch: Partial<SceneObject>) => {
    if (selectedObject)
      dispatch({ type: 'update', id: selectedObject.id, patch })
  }
  const remove = () => {
    if (!selectedObject) return
    dispatch({ type: 'delete', id: selectedObject.id })
    setMessage('Objeto excluído. Você pode desfazer essa ação.')
  }
  const duplicate = () => {
    if (!selectedObject) return
    if (state.objects.length >= MAX_OBJECTS) {
      setMessage(
        'Limite de objetos atingido. Exclua uma peça antes de duplicar.',
      )
      return
    }
    const object = {
      ...detach(selectedObject),
      id: crypto.randomUUID(),
      x: selectedObject.x + 16,
      y: selectedObject.y + 16,
    }
    dispatch({ type: 'add', object })
    select(object.id)
    setMessage('Objeto duplicado.')
  }
  return {
    state,
    dispatch,
    selectedObject,
    select,
    add,
    update,
    remove,
    duplicate,
    message,
    setMessage,
  }
}
