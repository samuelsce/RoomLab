import { findItem } from '../catalog/catalog.ts'
import type { ObjectKind } from '../catalog/catalog.ts'
import type { SceneObject } from './scenes.ts'
import { constrainObject, ROOM } from './geometry.ts'
import { defaultAppearance } from './appearance.ts'
import type { RoomAppearance } from './appearance.ts'
import { attachEquipment, detach } from './surfaces.ts'
import { transformObjects } from './grouping.ts'

export const MAX_OBJECTS = 100
export const HISTORY_LIMIT = 50
export interface RoomSnapshot {
  objects: SceneObject[]
  appearance: RoomAppearance
}
export interface EditorState extends RoomSnapshot {
  past: RoomSnapshot[]
  future: RoomSnapshot[]
  gestureStart: RoomSnapshot | null
  feedback: string
}
export type EditorAction =
  | { type: 'add'; object: SceneObject }
  | { type: 'update'; id: string; patch: Partial<SceneObject> }
  | { type: 'delete'; id: string }
  | { type: 'layer'; id: string; direction: 'front' | 'back' }
  | { type: 'attach'; id: string }
  | { type: 'detach'; id: string }
  | { type: 'appearance'; appearance: RoomAppearance }
  | { type: 'begin' }
  | { type: 'preview'; object: SceneObject }
  | { type: 'end' }
  | { type: 'cancel' }
  | { type: 'undo' }
  | { type: 'redo' }

export function createEditorState(
  objects: SceneObject[],
  appearance = defaultAppearance('study'),
): EditorState {
  return {
    objects: objects.map(constrainObject),
    appearance,
    past: [],
    future: [],
    gestureStart: null,
    feedback: '',
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
        object.rotation === other.rotation &&
        object.attachedTo === other.attachedTo
      )
    })
  )
}

function snapshot(state: RoomSnapshot): RoomSnapshot {
  return { objects: state.objects, appearance: state.appearance }
}
function commit(
  state: EditorState,
  objects: SceneObject[],
  appearance = state.appearance,
): EditorState {
  const previous = state.gestureStart ?? snapshot(state)
  if (
    sameObjects(previous.objects, objects) &&
    previous.appearance.wall === appearance.wall &&
    previous.appearance.floor === appearance.floor
  )
    return { ...state, objects, appearance, gestureStart: null }
  return {
    objects,
    appearance,
    past: [...state.past, previous].slice(-HISTORY_LIMIT),
    future: [],
    gestureStart: null,
    feedback: '',
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
        : { ...state, gestureStart: snapshot(state), feedback: '' }
    case 'preview': {
      if (!state.gestureStart) return state
      const objects = transformObjects(
        state.gestureStart.objects,
        action.object.id,
        action.object,
      )
      return { ...state, objects }
    }
    case 'end':
      return state.gestureStart ? commit(state, state.objects) : state
    case 'cancel':
      return state.gestureStart
        ? { ...state, ...state.gestureStart, gestureStart: null, feedback: '' }
        : state
    case 'add':
      return state.objects.length >= MAX_OBJECTS ||
        state.objects.some((object) => object.id === action.object.id)
        ? state
        : commit(state, [...state.objects, constrainObject(action.object)])
    case 'update': {
      const objects = transformObjects(state.objects, action.id, action.patch)
      return objects === state.objects &&
        state.objects.some((object) => object.attachedTo === action.id)
        ? {
            ...state,
            feedback:
              'O conjunto não cabe nessa rotação. Desvincule os equipamentos ou escolha outro ângulo.',
          }
        : commit(state, objects)
    }
    case 'attach':
      return commit(state, attachEquipment(state.objects, action.id))
    case 'detach':
      return commit(
        state,
        state.objects.map((object) =>
          object.id === action.id || object.attachedTo === action.id
            ? detach(object)
            : object,
        ),
      )
    case 'appearance':
      return commit(state, state.objects, action.appearance)
    case 'delete':
      return commit(
        state,
        state.objects
          .filter((object) => object.id !== action.id)
          .map((object) =>
            object.attachedTo === action.id ? detach(object) : object,
          ),
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
        return {
          ...state,
          ...state.gestureStart,
          gestureStart: null,
          feedback: '',
        }
      const previous = state.past.at(-1)
      return previous
        ? {
            ...previous,
            past: state.past.slice(0, -1),
            future: [snapshot(state), ...state.future],
            gestureStart: null,
            feedback: '',
          }
        : state
    }
    case 'redo': {
      const next = state.future[0]
      return next && !state.gestureStart
        ? {
            ...next,
            past: [...state.past, snapshot(state)].slice(-HISTORY_LIMIT),
            future: state.future.slice(1),
            gestureStart: null,
            feedback: '',
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
