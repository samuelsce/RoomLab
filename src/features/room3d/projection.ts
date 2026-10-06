import { ROOM } from '../editor/geometry.ts'
import type { SceneObject } from '../editor/scenes.ts'

// One hundred plan units correspond to one model unit. This is a visual
// projection, not a measurement tool for buying furniture.
export function projectObject(object: SceneObject, objects: SceneObject[]) {
  const cx = object.x + object.w / 2
  const cy = object.y + object.h / 2
  const tabletopKinds = [
    'monitor',
    'dual-monitor',
    'pc',
    'keyboard',
    'lamp',
    'plant',
  ]
  const supported =
    tabletopKinds.includes(object.kind) &&
    objects.some((desk) => {
      if (desk.kind !== 'desk' && desk.kind !== 'round-desk') return false
      const angle = -((desk.rotation ?? 0) * Math.PI) / 180
      const dx = cx - (desk.x + desk.w / 2)
      const dy = cy - (desk.y + desk.h / 2)
      const localX = dx * Math.cos(angle) - dy * Math.sin(angle)
      const localY = dx * Math.sin(angle) + dy * Math.cos(angle)
      return Math.abs(localX) <= desk.w / 2 && Math.abs(localY) <= desk.h / 2
    })
  return {
    x: (cx - ROOM.left - ROOM.width / 2) / 100,
    z: (cy - ROOM.top - ROOM.height / 2) / 100,
    width: object.w / 100,
    depth: object.h / 100,
    rotation: -((object.rotation ?? 0) * Math.PI) / 180,
    elevation: supported ? 0.86 : 0,
  }
}
