import type { SceneObject } from './scenes.ts'

export const isDesk = (object: SceneObject) =>
  object.kind === 'desk' || object.kind === 'round-desk'
export const isEquipment = (object: SceneObject) =>
  ['monitor', 'dual-monitor', 'pc', 'keyboard', 'lamp', 'plant'].includes(
    object.kind,
  )

export function coversCenter(surface: SceneObject, cx: number, cy: number) {
  const angle = -((surface.rotation ?? 0) * Math.PI) / 180
  const dx = cx - (surface.x + surface.w / 2)
  const dy = cy - (surface.y + surface.h / 2)
  const localX = dx * Math.cos(angle) - dy * Math.sin(angle)
  const localY = dx * Math.sin(angle) + dy * Math.cos(angle)
  return Math.abs(localX) <= surface.w / 2 && Math.abs(localY) <= surface.h / 2
}

export function supportingDesk(object: SceneObject, objects: SceneObject[]) {
  if (!isEquipment(object)) return undefined
  const supports = (desk: SceneObject) =>
    isDesk(desk) &&
    coversCenter(desk, object.x + object.w / 2, object.y + object.h / 2)
  return (
    objects.find((desk) => desk.id === object.attachedTo && supports(desk)) ??
    objects.find(supports)
  )
}

export function attachEquipment(objects: SceneObject[], deskId: string) {
  const desk = objects.find((object) => object.id === deskId && isDesk(object))
  if (!desk) return objects
  return objects.map((object) =>
    !object.attachedTo && supportingDesk(object, objects)?.id === deskId
      ? { ...object, attachedTo: deskId }
      : object,
  )
}

export function detach(object: SceneObject): SceneObject {
  const copy = { ...object }
  delete copy.attachedTo
  return copy
}
