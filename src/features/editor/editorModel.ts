import { findItem } from '../catalog/catalog.ts'
import type { ObjectKind } from '../catalog/catalog.ts'
import type { SceneObject } from './scenes.ts'
import { constrainObject, ROOM } from './geometry.ts'

export const MAX_OBJECTS = 100
export const HISTORY_LIMIT = 50
export interface EditorState {
  objects: SceneObject[]
  past: SceneObject[][]
  future: SceneObject[][]
  gestureStart: SceneObject[] | null
}
export type EditorAction =
  | { type: 'add'; object: SceneObject }
  | { type: 'update'; id: string; patch: Partial<SceneObject> }
  | { type: 'delete'; id: string }
  | { type: 'layer'; id: string; direction: 'front' | 'back' }
  | { type: 'begin' }
  | { type: 'preview'; object: SceneObject }
  | { type: 'end' }
  | { type: 'cancel' }
  | { type: 'undo' }
  | { type: 'redo' }

export function createEditorState(objects: SceneObject[]): EditorState {
  return {
    objects: objects.map(constrainObject),
    past: [],
    future: [],
    gestureStart: null,
  }
}

function sameObjects(a: SceneObject[], b: SceneObject[]) {
  return (
    a.length === b.length &&
    a.every((object, index) => {
      const other = b[index]
      return (
        object.id === other.id &&
        object.kind === other.kind &&
        object.x === other.x &&
        object.y === other.y &&
        object.w === other.w &&
        object.h === other.h &&
        object.color === other.color &&
        object.rotation === other.rotation
      )
    })
  )
}

function commit(state: EditorState, objects: SceneObject[]): EditorState {
  const previous = state.gestureStart ?? state.objects
  if (sameObjects(previous, objects))
    return { ...state, objects, gestureStart: null }
  return {
    objects,
    past: [...state.past, previous].slice(-HISTORY_LIMIT),
    future: [],
    gestureStart: null,
  }
}

export function editorReducer(
  state: EditorState,
  action: EditorAction,
): EditorState {
  switch (action.type) {
    case 'begin':
      return state.gestureStart
        ? state
        : { ...state, gestureStart: state.objects }
    case 'preview':
      return state.gestureStart
        ? {
            ...state,
            objects: state.objects.map((object) =>
              object.id === action.object.id
                ? constrainObject(action.object)
                : object,
            ),
          }
        : state
    case 'end':
      return state.gestureStart ? commit(state, state.objects) : state
    case 'cancel':
      return state.gestureStart
        ? { ...state, objects: state.gestureStart, gestureStart: null }
        : state
    case 'add':
      return state.objects.length >= MAX_OBJECTS ||
        state.objects.some((object) => object.id === action.object.id)
        ? state
        : commit(state, [...state.objects, constrainObject(action.object)])
    case 'update':
      return commit(
        state,
        state.objects.map((object) =>
          object.id === action.id
            ? constrainObject({
                ...object,
                ...action.patch,
                id: object.id,
                kind: object.kind,
              })
            : object,
        ),
      )
    case 'delete':
      return commit(
        state,
        state.objects.filter((object) => object.id !== action.id),
      )
    case 'layer': {
      const object = state.objects.find((object) => object.id === action.id)
      if (!object) return state
      const rest = state.objects.filter((object) => object.id !== action.id)
      return commit(
        state,
        action.direction === 'front' ? [...rest, object] : [object, ...rest],
      )
    }
    case 'undo': {
      if (state.gestureStart)
        return { ...state, objects: state.gestureStart, gestureStart: null }
      const previous = state.past.at(-1)
      return previous
        ? {
            objects: previous,
            past: state.past.slice(0, -1),
            future: [state.objects, ...state.future],
            gestureStart: null,
          }
        : state
    }
    case 'redo': {
      const next = state.future[0]
      return next && !state.gestureStart
        ? {
            objects: next,
            past: [...state.past, state.objects].slice(-HISTORY_LIMIT),
            future: state.future.slice(1),
            gestureStart: null,
          }
        : state
    }
  }
}

const defaultSizes: Record<ObjectKind, [number, number]> = {
  bed: [164, 231],
  desk: [250, 110],
  'round-desk': [175, 90],
  chair: [95, 95],
  monitor: [105, 42],
  'dual-monitor': [160, 45],
  pc: [48, 68],
  keyboard: [75, 28],
  lamp: [42, 42],
  plant: [85, 90],
  rug: [260, 170],
  frame: [65, 80],
  shelf: [150, 55],
}

export function createObject(
  kind: ObjectKind,
  id: string,
  count: number,
  point?: { x: number; y: number },
): SceneObject {
  const [w, h] = defaultSizes[kind]
  const offset = (count % 6) * 12
  return constrainObject({
    id,
    kind,
    w,
    h,
    color: findItem(kind).color,
    rotation: 0,
    x: (point?.x ?? ROOM.left + ROOM.width / 2 + offset) - w / 2,
    y: (point?.y ?? ROOM.top + ROOM.height / 2 + offset) - h / 2,
  })
}
