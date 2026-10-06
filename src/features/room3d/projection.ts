import { ROOM } from '../editor/geometry.ts'
import type { SceneObject } from '../editor/scenes.ts'

function coversCenter(surface: SceneObject, cx: number, cy: number) {
  const angle = -((surface.rotation ?? 0) * Math.PI) / 180
  const dx = cx - (surface.x + surface.w / 2)
  const dy = cy - (surface.y + surface.h / 2)
  const localX = dx * Math.cos(angle) - dy * Math.sin(angle)
  const localY = dx * Math.sin(angle) + dy * Math.cos(angle)
  return Math.abs(localX) <= surface.w / 2 && Math.abs(localY) <= surface.h / 2
}

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
  const supportedDesk = tabletopKinds.includes(object.kind)
    ? objects.find((desk) => {
        if (desk.kind !== 'desk' && desk.kind !== 'round-desk') return false
        return coversCenter(desk, cx, cy)
      })
    : undefined
  const rugElevation = (target: SceneObject) =>
    target.kind !== 'rug' &&
    target.kind !== 'frame' &&
    objects.some(
      (rug) =>
        rug.kind === 'rug' &&
        coversCenter(rug, target.x + target.w / 2, target.y + target.h / 2),
    )
      ? 0.04
      : 0
  return {
    x: (cx - ROOM.left - ROOM.width / 2) / 100,
    z: (cy - ROOM.top - ROOM.height / 2) / 100,
    width: object.w / 100,
    depth: object.h / 100,
    rotation: -((object.rotation ?? 0) * Math.PI) / 180,
    elevation: supportedDesk
      ? 0.86 + rugElevation(supportedDesk)
      : rugElevation(object),
  }
}
