import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createEditorState,
  editorReducer,
} from '../src/features/editor/editorModel.ts'
import { getSceneObjects } from '../src/features/editor/scenes.ts'
import type { SceneObject } from '../src/features/editor/scenes.ts'
import { rotatedSize, ROOM } from '../src/features/editor/geometry.ts'
import {
  defaultAppearance,
  parseAppearance,
} from '../src/features/editor/appearance.ts'
import { parseSetups } from '../src/features/setups/storage.ts'
import { validateSharedDocument } from '../src/features/sharing/document.ts'
import {
  encodeSharedDocument,
  decodeSharedDocument,
} from '../src/features/sharing/codec.ts'
import { projectObject } from '../src/features/room3d/projection.ts'

function grouped() {
  return editorReducer(
    createEditorState(getSceneObjects('gamer'), defaultAppearance('gamer')),
    { type: 'attach', id: 'desk' },
  )
}
const center = (object: SceneObject) => [
  object.x + object.w / 2,
  object.y + object.h / 2,
]
function assertInside(object: SceneObject) {
  const [cx, cy] = center(object)
  const bounds = rotatedSize(object.w, object.h, object.rotation ?? 0)
  assert.ok(cx - bounds.w / 2 >= ROOM.left - 0.001)
  assert.ok(cy - bounds.h / 2 >= ROOM.top - 0.001)
  assert.ok(cx + bounds.w / 2 <= ROOM.left + ROOM.width + 0.001)
  assert.ok(cy + bounds.h / 2 <= ROOM.top + ROOM.height + 0.001)
}

test('explicit grouping attaches only supported equipment and keeps offsets through drag, cancel and undo', () => {
  const initial = grouped()
  const members = initial.objects.filter(
    (object) => object.attachedTo === 'desk',
  )
  assert.deepEqual(
    members.map((object) => object.id),
    ['monitor', 'pc', 'keyboard', 'lamp'],
  )
  let state = editorReducer(initial, { type: 'begin' })
  const desk = initial.objects.find((object) => object.id === 'desk')!
  for (let i = 1; i <= 15; i++)
    state = editorReducer(state, {
      type: 'preview',
      object: { ...desk, x: desk.x + i, y: desk.y + i },
    })
  assert.equal(state.past.length, 1)
  for (const member of members) {
    const moved = state.objects.find((object) => object.id === member.id)!
    assert.equal(moved.x - member.x, 15)
    assert.equal(moved.y - member.y, 15)
    assert.equal(projectObject(moved, state.objects).elevation, 0.86)
  }
  const cancelled = editorReducer(state, { type: 'cancel' })
  assert.deepEqual(cancelled.objects, initial.objects)
  state = editorReducer(state, { type: 'end' })
  assert.equal(state.past.length, 2)
  const undone = editorReducer(state, { type: 'undo' })
  assert.deepEqual(undone.objects, initial.objects)
  assert.deepEqual(
    editorReducer(undone, { type: 'redo' }).objects,
    state.objects,
  )
})

test('group rotation is rigid, preserves member angles and moves the entire bounding box inside the room', () => {
  const initial = grouped()
  const rotated = editorReducer(initial, {
    type: 'update',
    id: 'desk',
    patch: { rotation: 90, x: -999, y: -999 },
  })
  const beforeDesk = initial.objects.find((object) => object.id === 'desk')!
  const afterDesk = rotated.objects.find((object) => object.id === 'desk')!
  const [cx, cy] = center(beforeDesk)
  const [nx, ny] = center(afterDesk)
  for (const member of initial.objects.filter(
    (object) => object.attachedTo === 'desk',
  )) {
    const moved = rotated.objects.find((object) => object.id === member.id)!
    const [mx, my] = center(member)
    const [ax, ay] = center(moved)
    assert.ok(Math.abs(ax - nx + my - cy) < 0.001)
    assert.ok(Math.abs(ay - ny - mx + cx) < 0.001)
    assert.equal(moved.rotation, 90)
    assertInside(moved)
    assert.equal(projectObject(moved, rotated.objects).elevation, 0.86)
  }
  assertInside(afterDesk)
  for (const angle of [15, 45, 180, 270, 359]) {
    const state = editorReducer(initial, {
      type: 'update',
      id: 'desk',
      patch: { rotation: angle, x: 999, y: 999 },
    })
    state.objects.forEach(assertInside)
  }
})

test('moving equipment off a desk, shrinking or deleting the desk releases links and undo restores them', () => {
  const initial = grouped()
  const moved = editorReducer(initial, {
    type: 'update',
    id: 'monitor',
    patch: { x: 510, y: 450 },
  })
  assert.equal(
    moved.objects.find((object) => object.id === 'monitor')!.attachedTo,
    undefined,
  )
  assert.deepEqual(
    editorReducer(moved, { type: 'undo' }).objects,
    initial.objects,
  )
  const shrunk = editorReducer(initial, {
    type: 'update',
    id: 'desk',
    patch: { w: 100, h: 60 },
  })
  assert.equal(
    shrunk.objects.find((object) => object.id === 'pc')!.attachedTo,
    undefined,
  )
  assert.equal(shrunk.objects.find((object) => object.id === 'pc')!.w, 50)
  const deleted = editorReducer(initial, { type: 'delete', id: 'desk' })
  assert.equal(deleted.objects.length, initial.objects.length - 1)
  assert.ok(deleted.objects.every((object) => !object.attachedTo))
  assert.deepEqual(
    editorReducer(deleted, { type: 'undo' }).objects,
    initial.objects,
  )
  const detached = editorReducer(initial, { type: 'detach', id: 'desk' })
  assert.ok(detached.objects.every((object) => !object.attachedTo))
  assert.deepEqual(
    editorReducer(detached, { type: 'undo' }).objects,
    initial.objects,
  )
})

test('environment choices share one history with objects and no-op choices preserve redo', () => {
  const initial = grouped()
  const appearance = { wall: '#889f93', floor: 'stone' as const }
  const changed = editorReducer(initial, { type: 'appearance', appearance })
  assert.equal(changed.past.length, 2)
  assert.deepEqual(changed.objects, initial.objects)
  const undone = editorReducer(changed, { type: 'undo' })
  assert.deepEqual(undone.appearance, defaultAppearance('gamer'))
  const noOp = editorReducer(undone, {
    type: 'appearance',
    appearance: undone.appearance,
  })
  assert.equal(noOp.future.length, 1)
  assert.deepEqual(editorReducer(noOp, { type: 'redo' }).appearance, appearance)
  assert.deepEqual(
    editorReducer(editorReducer(changed, { type: 'undo' }), { type: 'undo' })
      .objects,
    createEditorState(getSceneObjects('gamer')).objects,
  )
})

test('legacy documents keep their default finishes; backups and compressed links preserve new finishes and membership', async () => {
  const state = grouped()
  const raw = {
    id: 'setup',
    revision: 'one',
    name: 'Meu setup',
    scene: 'gamer',
    objects: getSceneObjects('gamer'),
    createdAt: '2026-10-06T12:00:00Z',
    updatedAt: '2026-10-06T12:00:00Z',
  }
  const parse = (setup: unknown) =>
    parseSetups(JSON.stringify({ version: 1, setups: [setup] }))[0]
  assert.equal(parse(raw).appearance, undefined)
  const saved = parse({
    ...raw,
    objects: state.objects,
    appearance: { wall: '#889F93', floor: 'walnut', secret: 'discard' },
  })
  assert.deepEqual(saved.appearance, { wall: '#889f93', floor: 'walnut' })
  const shared = validateSharedDocument({ ...saved, schemaVersion: 1 })
  assert.deepEqual(
    await decodeSharedDocument(await encodeSharedDocument(shared)),
    shared,
  )
  assert.equal(
    shared.objects.find((object) => object.id === 'monitor')!.attachedTo,
    'desk',
  )
  for (const appearance of [
    null,
    {},
    { wall: 'url(evil)', floor: 'oak' },
    { wall: '#ffffff', floor: 'toString' },
  ]) {
    assert.throws(() => parseAppearance(appearance))
    assert.throws(() => parse({ ...raw, appearance }))
  }
  for (const [kind, attachedTo] of [
    ['monitor', 'missing'],
    ['desk', 'desk'],
    ['chair', 'desk'],
    ['monitor', 'bed'],
    ['monitor', ''],
  ]) {
    const objects = state.objects.map((object) =>
      object.id === 'monitor' ? { ...object, kind, attachedTo } : object,
    )
    assert.throws(() => parse({ ...raw, objects }))
    assert.throws(() =>
      validateSharedDocument({ ...raw, objects, schemaVersion: 1 }),
    )
  }
})
