import assert from 'node:assert/strict'
import { test } from 'node:test'
import { projectObject } from '../src/features/room3d/projection.ts'
import { getSceneObjects } from '../src/features/editor/scenes.ts'
import type { SceneObject } from '../src/features/editor/scenes.ts'
import { constrainObject } from '../src/features/editor/geometry.ts'
import { parseSetups } from '../src/features/setups/storage.ts'

test('plan centers, dimensions and clockwise rotations project into the same room', () => {
  const object: SceneObject = {
    id: 'piece',
    kind: 'desk',
    x: 330,
    y: 249,
    w: 100,
    h: 100,
    color: '#123456',
    rotation: 90,
  }
  const p = projectObject(object, [object])
  assert.equal(p.x, 0)
  assert.equal(p.z, 0)
  assert.equal(p.width, 1)
  assert.equal(p.depth, 1)
  assert.equal(p.rotation, -Math.PI / 2)
  assert.equal(p.elevation, 0)
})
test('equipment rests on a rotated desktop and returns to the floor when moved off', () => {
  const desk: SceneObject = {
    id: 'desk',
    kind: 'desk',
    x: 280,
    y: 249,
    w: 200,
    h: 100,
    color: '#123456',
    rotation: 90,
  }
  const monitor: SceneObject = {
    id: 'screen',
    kind: 'monitor',
    x: 360,
    y: 210,
    w: 40,
    h: 40,
    color: '#123456',
  }
  assert.equal(projectObject(monitor, [desk, monitor]).elevation, 0.86)
  assert.equal(
    projectObject({ ...monitor, x: 435 }, [desk, monitor]).elevation,
    0,
  )
  assert.equal(projectObject(monitor, [monitor]).elevation, 0)
})
test('gamer preset includes a bed and survives the existing version-one storage format', () => {
  const objects = getSceneObjects('gamer').map(constrainObject)
  const saved = {
    id: 'gamer',
    name: 'Meu quarto gamer',
    scene: 'gamer',
    objects,
    createdAt: '2026-10-06T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
    revision: 'one',
  }
  const parsed = parseSetups(JSON.stringify({ version: 1, setups: [saved] }))
  assert.equal(parsed[0].scene, 'gamer')
  assert.equal(
    parsed[0].objects.find((o) => o.kind === 'bed')?.color,
    '#657391',
  )
  assert.equal(parsed[0].objects.length, 10)
})
