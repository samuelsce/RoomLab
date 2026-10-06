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

test('rug support lifts furniture and its desktop equipment together, including after rotation', () => {
  const rug: SceneObject = {
    id: 'rug',
    kind: 'rug',
    x: 230,
    y: 220,
    w: 260,
    h: 140,
    rotation: 90,
    color: '#123456',
  }
  const desk: SceneObject = {
    id: 'desk',
    kind: 'desk',
    x: 310,
    y: 220,
    w: 100,
    h: 80,
    color: '#123456',
  }
  const monitor: SceneObject = {
    id: 'monitor',
    kind: 'monitor',
    x: 320,
    y: 230,
    w: 40,
    h: 30,
    color: '#123456',
  }
  const chair: SceneObject = {
    id: 'chair',
    kind: 'chair',
    x: 320,
    y: 320,
    w: 70,
    h: 70,
    color: '#123456',
  }
  const objects = [rug, desk, monitor, chair]
  assert.equal(projectObject(desk, objects).elevation, 0.04)
  assert.equal(projectObject(monitor, objects).elevation, 0.9)
  assert.equal(projectObject(chair, objects).elevation, 0.04)
  assert.equal(projectObject({ ...chair, x: 500 }, objects).elevation, 0)
  assert.equal(projectObject(rug, objects).elevation, 0)
})

test('existing version-one furniture keeps its original footprint after the model refinement', () => {
  const objects: SceneObject[] = [
    {
      id: 'desk',
      kind: 'desk',
      x: 169,
      y: 143,
      w: 297,
      h: 155,
      color: '#b78d60',
    },
    {
      id: 'chair',
      kind: 'chair',
      x: 260,
      y: 302,
      w: 131,
      h: 123,
      color: '#334452',
    },
    {
      id: 'monitor',
      kind: 'monitor',
      x: 240,
      y: 157,
      w: 117,
      h: 84,
      color: '#334452',
    },
  ]
  const saved = {
    id: 'legacy',
    name: 'Setup anterior',
    scene: 'study',
    objects,
    createdAt: '2026-10-06T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
    revision: 'one',
  }
  const restored = parseSetups(
    JSON.stringify({ version: 1, setups: [saved] }),
  )[0]
  for (const original of objects) {
    const object = restored.objects.find((item) => item.id === original.id)!
    assert.deepEqual(
      [object.x, object.y, object.w, object.h],
      [original.x, original.y, original.w, original.h],
    )
    assert.equal(
      projectObject(object, restored.objects).width,
      original.w / 100,
    )
  }
})
