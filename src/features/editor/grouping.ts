import {
  constrainObject,
  normalizeAngle,
  rotatedSize,
  ROOM,
} from './geometry.ts'
import { coversCenter, detach, isDesk } from './surfaces.ts'
import type { SceneObject } from './scenes.ts'

// All members move from the same snapshot, preserving offsets during a drag.
export function transformObjects(
  objects: SceneObject[],
  id: string,
  patch: Partial<SceneObject>,
): SceneObject[] {
  const original = objects.find((object) => object.id === id)
  if (!original) return objects
  const next = constrainObject({
    ...original,
    ...patch,
    id,
    kind: original.kind,
  })
  // Group membership is changed only by the dedicated attach/detach actions.
  if (original.attachedTo) next.attachedTo = original.attachedTo
  else delete next.attachedTo
  const members = isDesk(original)
    ? objects.filter((object) => object.attachedTo === id)
    : []
  const resized = original.w !== next.w || original.h !== next.h
  const requestedResize =
    (patch.w !== undefined && patch.w !== original.w) ||
    (patch.h !== undefined && patch.h !== original.h)
  // A rotation must not silently shrink the desktop while leaving its members.
  if (members.length && resized && !requestedResize) return objects
  if (!members.length || resized) {
    return objects.map((object) => {
      const changed = object.id === id ? next : object
      const desk = objects.find((item) => item.id === changed.attachedTo)
      const surface = desk?.id === id ? next : desk
      return surface &&
        !coversCenter(
          surface,
          changed.x + changed.w / 2,
          changed.y + changed.h / 2,
        )
        ? detach(changed)
        : changed
    })
  }
  const angle = ((next.rotation! - (original.rotation ?? 0)) * Math.PI) / 180
  const cx = original.x + original.w / 2
  const cy = original.y + original.h / 2
  const nx = next.x + next.w / 2
  const ny = next.y + next.h / 2
  const transformed = [
    next,
    ...members.map((member) => {
      const dx = member.x + member.w / 2 - cx
      const dy = member.y + member.h / 2 - cy
      return {
        ...member,
        x: nx + dx * Math.cos(angle) - dy * Math.sin(angle) - member.w / 2,
        y: ny + dx * Math.sin(angle) + dy * Math.cos(angle) - member.h / 2,
        rotation: normalizeAngle(
          (member.rotation ?? 0) + next.rotation! - (original.rotation ?? 0),
        ),
      }
    }),
  ]
  const bounds = transformed.map((object) => {
    const size = rotatedSize(object.w, object.h, object.rotation ?? 0)
    return {
      left: object.x + object.w / 2 - size.w / 2,
      right: object.x + object.w / 2 + size.w / 2,
      top: object.y + object.h / 2 - size.h / 2,
      bottom: object.y + object.h / 2 + size.h / 2,
    }
  })
  const left = Math.min(...bounds.map((bound) => bound.left))
  const right = Math.max(...bounds.map((bound) => bound.right))
  const top = Math.min(...bounds.map((bound) => bound.top))
  const bottom = Math.max(...bounds.map((bound) => bound.bottom))
  if (right - left > ROOM.width + 0.001 || bottom - top > ROOM.height + 0.001)
    return objects
  const dx = Math.max(
    ROOM.left - left,
    Math.min(0, ROOM.left + ROOM.width - right),
  )
  const dy = Math.max(
    ROOM.top - top,
    Math.min(0, ROOM.top + ROOM.height - bottom),
  )
  const replacements = new Map(
    transformed.map((object) => [
      object.id,
      { ...object, x: object.x + dx, y: object.y + dy },
    ]),
  )
  return objects.map((object) => replacements.get(object.id) ?? object)
}
