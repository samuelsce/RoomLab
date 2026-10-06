import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as THREE from 'three'
import { buildChair } from '../src/features/room3d/chair.ts'
import { strut, tabletop } from '../src/features/room3d/primitives.ts'

test('chair stays inside its footprint with wheels touching the ground after resizing', () => {
  for (const gamer of [false, true]) {
    for (const [width, depth] of [
      [0.4, 0.4],
      [0.95, 0.95],
      [1.31, 1.23],
      [1.9, 0.4],
      [0.4, 1.8],
    ]) {
      const chair = buildChair(
        new THREE.Group(),
        width,
        depth,
        '#334452',
        gamer,
      )
      const bounds = new THREE.Box3().setFromObject(chair)
      assert.ok(bounds.min.x >= -width / 2 && bounds.max.x <= width / 2)
      assert.ok(bounds.min.z >= -depth / 2 && bounds.max.z <= depth / 2)
      assert.ok(
        bounds.min.y > 0 && bounds.min.y < 0.015 * Math.min(width, depth),
      )
      for (let i = 0; i < 5; i++) {
        const caster = chair.getObjectByName(`chair-caster-${i}`)!
        const wheel = caster.children[2] as THREE.Mesh
        const axis = new THREE.Vector3(0, 1, 0).transformDirection(
          wheel.matrixWorld,
        )
        assert.ok(Math.abs(axis.y) < 0.00001, 'wheel axle must be horizontal')
        const casterBounds = new THREE.Box3().setFromObject(caster)
        const arm = caster.parent!.children[0] as THREE.Mesh
        const armBounds = new THREE.Box3().setFromObject(arm)
        assert.ok(
          armBounds.intersectsBox(casterBounds),
          'base arm must connect to its caster',
        )
      }
    }
  }
})

test('rotated struts end at their attachment points instead of orbiting an offset pivot', () => {
  const root = new THREE.Group()
  const from = new THREE.Vector3(0, 0.16, 0.035)
  const to = new THREE.Vector3(0, 0.105, 0.4)
  const arm = strut(root, from.toArray(), to.toArray(), 0.029, '#25313b')
  const half = from.distanceTo(to) / 2
  const lower = arm.localToWorld(new THREE.Vector3(0, -half, 0))
  const upper = arm.localToWorld(new THREE.Vector3(0, half, 0))
  assert.ok(lower.distanceTo(from) < 0.00001)
  assert.ok(upper.distanceTo(to) < 0.00001)
})

test('both desk shapes expose the same support height and keep their footprint', () => {
  for (const compact of [false, true]) {
    const mesh = tabletop(new THREE.Group(), 1.75, 0.9, '#b78d60', compact)
    const bounds = new THREE.Box3().setFromObject(mesh)
    assert.ok(Math.abs(bounds.max.y - 0.86) < 0.00001)
    assert.ok(Math.abs(bounds.min.x + 0.875) < 0.00001)
    assert.ok(Math.abs(bounds.max.z - 0.45) < 0.00001)
  }
})
