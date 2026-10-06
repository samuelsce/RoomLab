import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as THREE from 'three'
import {
  createSelectionMarker,
  isSelectionTap,
  pickObject,
  updateSelectionMarker,
} from '../src/features/room3d/selection.ts'

function furniture(root: THREE.Object3D, id: string, z = 0) {
  const group = new THREE.Group()
  group.userData.objectId = id
  group.position.z = z
  group.rotation.y = Math.PI / 4
  const detail = new THREE.Group()
  detail.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)))
  group.add(detail)
  root.add(group)
  return group
}

test('picking resolves nested meshes to the nearest furniture after transforms', () => {
  const root = new THREE.Group()
  root.position.x = 0.2
  furniture(root, 'rear')
  const front = furniture(root, 'front', 1)
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20)
  camera.position.set(0.2, 0, 5)
  const raycaster = new THREE.Raycaster()
  const point = new THREE.Vector2()
  assert.equal(pickObject(raycaster, root, camera, point), 'front')
  front.position.x = 3
  assert.equal(pickObject(raycaster, root, camera, point), 'rear')
  assert.equal(
    pickObject(raycaster, root, camera, new THREE.Vector2(1, 1)),
    null,
  )
})

test('walls block picking rather than selecting furniture behind architecture', () => {
  const root = new THREE.Group()
  furniture(root, 'chair')
  const wall = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.1))
  wall.position.z = 2
  root.add(wall)
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20)
  camera.position.z = 5
  const raycaster = new THREE.Raycaster()
  assert.equal(pickObject(raycaster, root, camera, new THREE.Vector2()), null)
  wall.position.x = 4
  assert.equal(
    pickObject(raycaster, root, camera, new THREE.Vector2()),
    'chair',
  )
})

test('selection corners follow world bounds, reuse resources and disappear without a target', () => {
  const root = new THREE.Group()
  const target = furniture(root, 'chair')
  target.position.set(2, 0.9, -1)
  const marker = createSelectionMarker()
  const geometry = marker.geometry
  const material = marker.material
  for (const scale of [1, 1.5]) {
    target.scale.setScalar(scale)
    updateSelectionMarker(marker, target)
    assert.equal(marker.visible, true)
    const expected = new THREE.Box3()
      .setFromObject(target)
      .expandByScalar(0.035)
    const actual = new THREE.Box3().setFromBufferAttribute(
      geometry.getAttribute('position') as THREE.BufferAttribute,
    )
    assert.ok(actual.min.distanceTo(expected.min) < 0.000001)
    assert.ok(actual.max.distanceTo(expected.max) < 0.000001)
    assert.equal(marker.geometry, geometry)
    assert.equal(marker.material, material)
  }
  updateSelectionMarker(marker)
  assert.equal(marker.visible, false)
  updateSelectionMarker(marker, new THREE.Group())
  assert.equal(marker.visible, false)
  geometry.dispose()
  material.dispose()
})

test('dragging, long presses and multiple pointers cannot be selection taps', () => {
  assert.equal(isSelectionTap(0, 80, false), true)
  assert.equal(isSelectionTap(6, 200, false), true)
  assert.equal(isSelectionTap(6.1, 200, false), false)
  assert.equal(isSelectionTap(0, 700, false), false)
  assert.equal(isSelectionTap(0, 80, true), false)
})
