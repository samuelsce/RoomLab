import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  constrainObject,
  rotatedSize,
  ROOM,
  moveObject,
  resizeObject,
  sizeLimits,
} from '../src/features/editor/geometry.ts'
import {
  createEditorState,
  createObject,
  editorReducer,
  HISTORY_LIMIT,
  MAX_OBJECTS,
} from '../src/features/editor/editorModel.ts'

function assertInside(object: ReturnType<typeof createObject>) {
  const bounds = rotatedSize(object.w, object.h, object.rotation ?? 0)
  const cx = object.x + object.w / 2
  const cy = object.y + object.h / 2
  assert.ok(cx - bounds.w / 2 >= ROOM.left - 0.001)
  assert.ok(cy - bounds.h / 2 >= ROOM.top - 0.001)
  assert.ok(cx + bounds.w / 2 <= ROOM.left + ROOM.width + 0.001)
  assert.ok(cy + bounds.h / 2 <= ROOM.top + ROOM.height + 0.001)
}

test('rotated objects remain inside the room at every angle and boundary', () => {
  for (const kind of Object.keys(sizeLimits) as (keyof typeof sizeLimits)[]) {
    for (let rotation = 0; rotation < 360; rotation += 15) {
      for (const point of [
        { x: -1000, y: -1000 },
        { x: 2000, y: 2000 },
      ]) {
        const object = constrainObject({
          ...createObject(kind, 'id', 0),
          ...point,
          rotation,
          w: 9999,
          h: 9999,
        })
        assertInside(object)
        assert.ok(object.w >= sizeLimits[kind].minW)
        assert.ok(object.h >= sizeLimits[kind].minH)
      }
    }
  }
})

test('invalid coordinates and sizes are normalized, while snap uses room origin', () => {
  const object = constrainObject({
    ...createObject('chair', 'id', 0),
    x: NaN,
    y: Infinity,
    w: -1,
    h: NaN,
    rotation: -90,
  })
  assertInside(object)
  assert.equal(object.rotation, 270)
  const snapped = moveObject(createObject('plant', 'plant', 0), 237, 212, true)
  assert.equal(snapped.x, 239)
  assert.equal(snapped.y, 214)
})

test('resize respects type minimums and rotated room limits', () => {
  const object = { ...createObject('desk', 'desk', 0), rotation: 45 }
  const small = resizeObject(object, -9999, -9999)
  assertInside(small)
  assert.ok(small.w >= sizeLimits.desk.minW)
  const large = resizeObject(object, 9999, 9999)
  assertInside(large)
})

test('many pointer previews produce one undo entry and cancellation restores start', () => {
  const initial = createEditorState([createObject('plant', 'plant', 0)])
  let state = editorReducer(initial, { type: 'begin' })
  for (let i = 0; i < 20; i++)
    state = editorReducer(state, {
      type: 'preview',
      object: { ...state.objects[0], x: 150 + i },
    })
  assert.equal(state.past.length, 0)
  state = editorReducer(state, { type: 'end' })
  assert.equal(state.past.length, 1)
  state = editorReducer(state, { type: 'undo' })
  assert.deepEqual(state.objects, initial.objects)
  state = editorReducer(state, { type: 'redo' })
  assert.equal(state.objects[0].x, 169)
  state = editorReducer(state, { type: 'begin' })
  state = editorReducer(state, {
    type: 'preview',
    object: { ...state.objects[0], x: 200 },
  })
  state = editorReducer(state, { type: 'cancel' })
  assert.equal(state.objects[0].x, 169)
  assert.equal(state.past.length, 1)
})

test('new edits clear redo; add delete and layer changes are reversible', () => {
  const a = createObject('desk', 'a', 0)
  const b = createObject('plant', 'b', 1)
  let state = createEditorState([a])
  state = editorReducer(state, { type: 'add', object: b })
  state = editorReducer(state, { type: 'layer', id: 'a', direction: 'front' })
  assert.deepEqual(
    state.objects.map((object) => object.id),
    ['b', 'a'],
  )
  state = editorReducer(state, { type: 'undo' })
  assert.deepEqual(
    state.objects.map((object) => object.id),
    ['a', 'b'],
  )
  state = editorReducer(state, { type: 'delete', id: 'b' })
  assert.equal(state.future.length, 0)
  state = editorReducer(state, { type: 'undo' })
  assert.equal(state.objects.length, 2)
})

test('history and scene limits bound memory and ignore unchanged updates', () => {
  let state = createEditorState([])
  for (let i = 0; i < MAX_OBJECTS + 5; i++)
    state = editorReducer(state, {
      type: 'add',
      object: createObject('plant', `${i}`, i),
    })
  assert.equal(state.objects.length, MAX_OBJECTS)
  assert.equal(state.past.length, HISTORY_LIMIT)
  const count = state.past.length
  state = editorReducer(state, {
    type: 'update',
    id: '0',
    patch: { color: state.objects[0].color },
  })
  assert.equal(state.past.length, count)
})
