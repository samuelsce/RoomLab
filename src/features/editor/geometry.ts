import type { SceneObject } from './scenes.ts'
import type { ObjectKind } from '../catalog/catalog.ts'

export const ROOM = { left: 119, top: 94, width: 522, height: 410 }
export const GRID_SIZE = 10
export const sizeLimits: Record<
  ObjectKind,
  { minW: number; minH: number; maxW: number; maxH: number }
> = {
  bed: { minW: 90, minH: 140, maxW: 230, maxH: 300 },
  desk: { minW: 100, minH: 60, maxW: 360, maxH: 230 },
  'round-desk': { minW: 70, minH: 50, maxW: 260, maxH: 180 },
  chair: { minW: 40, minH: 40, maxW: 190, maxH: 180 },
  monitor: { minW: 40, minH: 30, maxW: 240, maxH: 150 },
  'dual-monitor': { minW: 70, minH: 30, maxW: 270, maxH: 150 },
  pc: { minW: 30, minH: 40, maxW: 150, maxH: 200 },
  keyboard: { minW: 30, minH: 18, maxW: 180, maxH: 90 },
  lamp: { minW: 30, minH: 30, maxW: 150, maxH: 170 },
  plant: { minW: 40, minH: 40, maxW: 200, maxH: 200 },
  rug: { minW: 100, minH: 60, maxW: 400, maxH: 300 },
  frame: { minW: 30, minH: 25, maxW: 150, maxH: 160 },
  shelf: { minW: 60, minH: 30, maxW: 250, maxH: 150 },
}

const finite = (value: number, fallback: number) =>
  Number.isFinite(value) ? value : fallback
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
export const normalizeAngle = (angle: number) =>
  ((finite(angle, 0) % 360) + 360) % 360

export function rotatedSize(w: number, h: number, rotation: number) {
  const radians = (rotation * Math.PI) / 180
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  return { w: w * cos + h * sin, h: w * sin + h * cos }
}

export function constrainObject(object: SceneObject): SceneObject {
  const limits = sizeLimits[object.kind]
  let w = clamp(finite(object.w, limits.minW), limits.minW, limits.maxW)
  let h = clamp(finite(object.h, limits.minH), limits.minH, limits.maxH)
  const rotation = normalizeAngle(object.rotation ?? 0)
  let bounds = rotatedSize(w, h, rotation)
  const scale = Math.min(1, ROOM.width / bounds.w, ROOM.height / bounds.h)
  w *= scale
  h *= scale
  bounds = rotatedSize(w, h, rotation)
  const cx = clamp(
    finite(object.x, ROOM.left) + w / 2,
    ROOM.left + bounds.w / 2,
    ROOM.left + ROOM.width - bounds.w / 2,
  )
  const cy = clamp(
    finite(object.y, ROOM.top) + h / 2,
    ROOM.top + bounds.h / 2,
    ROOM.top + ROOM.height - bounds.h / 2,
  )
  return { ...object, rotation, w, h, x: cx - w / 2, y: cy - h / 2 }
}

export function moveObject(
  object: SceneObject,
  x: number,
  y: number,
  snap = false,
) {
  const snappedX = snap
    ? ROOM.left + Math.round((x - ROOM.left) / GRID_SIZE) * GRID_SIZE
    : x
  const snappedY = snap
    ? ROOM.top + Math.round((y - ROOM.top) / GRID_SIZE) * GRID_SIZE
    : y
  return constrainObject({ ...object, x: snappedX, y: snappedY })
}

export function resizeObject(object: SceneObject, dx: number, dy: number) {
  const radians = ((object.rotation ?? 0) * Math.PI) / 180
  const localX = dx * Math.cos(radians) + dy * Math.sin(radians)
  const localY = -dx * Math.sin(radians) + dy * Math.cos(radians)
  const limits = sizeLimits[object.kind]
  const w = clamp(object.w + localX, limits.minW, limits.maxW)
  const h = clamp(object.h + localY, limits.minH, limits.maxH)
  // Keep the opposite corner stationary before the room boundary constraint.
  const shiftX = (w - object.w) / 2
  const shiftY = (h - object.h) / 2
  const cx =
    object.x +
    object.w / 2 +
    shiftX * Math.cos(radians) -
    shiftY * Math.sin(radians)
  const cy =
    object.y +
    object.h / 2 +
    shiftX * Math.sin(radians) +
    shiftY * Math.cos(radians)
  return constrainObject({ ...object, w, h, x: cx - w / 2, y: cy - h / 2 })
}
