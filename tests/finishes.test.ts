import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as THREE from 'three'
import { buildRoom, disposeRoom } from '../src/features/room3d/models.ts'
import {
  createEditorState,
  editorReducer,
} from '../src/features/editor/editorModel.ts'
import type { SceneObject } from '../src/features/editor/scenes.ts'

test('a grouped rotation that cannot fit never silently resizes or separates the equipment', () => {
  const objects: SceneObject[] = [
    {
      id: 'desk',
      kind: 'desk',
      x: 180,
      y: 180,
      w: 360,
      h: 230,
      color: '#b78d60',
    },
    {
      id: 'monitor',
      kind: 'monitor',
      x: 285,
      y: 200,
      w: 120,
      h: 42,
      color: '#334452',
    },
  ]
  const state = editorReducer(createEditorState(objects), {
    type: 'attach',
    id: 'desk',
  })
  const rejected = editorReducer(state, {
    type: 'update',
    id: 'desk',
    patch: { rotation: 45 },
  })
  assert.deepEqual(rejected.objects, state.objects)
  assert.equal(rejected.past.length, state.past.length)
  assert.match(rejected.feedback, /não cabe/)
})

test('finishes reach actual wall and floor materials; empty rooms need no canvas texture', () => {
  const room = buildRoom([], 'gamer', false, {
    wall: '#889f93',
    floor: 'stone',
  })
  try {
    const wall = room.children.find(
      (object) =>
        object.position.x === 0 &&
        object.position.y === 1.35 &&
        object.position.z === -2.12,
    ) as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
    assert.equal(wall.material.color.getHexString(), '889f93')
    const tiles = room.children.filter(
      (object) => object.position.y === 0.009,
    ) as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[]
    assert.equal(tiles.length, 64)
    assert.ok(
      tiles.every(
        (tile) =>
          tile.material.roughness === 0.94 && tile.material.metalness === 0,
      ),
    )
    assert.ok(
      tiles.every((tile) =>
        ['b5bdc3', 'c0c7cb', 'b9c2c7'].includes(
          tile.material.color.getHexString(),
        ),
      ),
    )
  } finally {
    disposeRoom(room)
  }
})
