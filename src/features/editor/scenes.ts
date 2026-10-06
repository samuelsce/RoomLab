import type { ObjectKind } from '../catalog/catalog'

export type SceneName = 'study' | 'dual' | 'plants' | 'empty'
export interface SceneObject {
  id: string
  kind: ObjectKind
  x: number
  y: number
  w: number
  h: number
  color: string
  rotation?: number
}
const base: SceneObject[] = [
  { id: 'rug', kind: 'rug', x: 206, y: 262, w: 316, h: 210, color: '#8da5b1' },
  {
    id: 'shelf',
    kind: 'shelf',
    x: 466,
    y: 103,
    w: 152,
    h: 85,
    color: '#b78d60',
  },
  {
    id: 'desk',
    kind: 'desk',
    x: 169,
    y: 143,
    w: 297,
    h: 155,
    color: '#b78d60',
  },
  { id: 'pc', kind: 'pc', x: 389, y: 174, w: 57, h: 68, color: '#334452' },
  {
    id: 'monitor',
    kind: 'monitor',
    x: 240,
    y: 157,
    w: 117,
    h: 84,
    color: '#334452',
  },
  {
    id: 'keyboard',
    kind: 'keyboard',
    x: 263,
    y: 239,
    w: 90,
    h: 42,
    color: '#eeeae2',
  },
  { id: 'lamp', kind: 'lamp', x: 187, y: 170, w: 57, h: 68, color: '#d5a14c' },
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
    id: 'plant',
    kind: 'plant',
    x: 513,
    y: 360,
    w: 111,
    h: 113,
    color: '#48705a',
  },
  { id: 'frame', kind: 'frame', x: 199, y: 82, w: 85, h: 50, color: '#d5a14c' },
]

export function getSceneObjects(scene: SceneName): SceneObject[] {
  if (scene === 'empty') return []
  const objects = base.map<SceneObject>((object) => {
    if (scene === 'dual' && object.id === 'monitor')
      return { ...object, kind: 'dual-monitor', x: 223, w: 148 }
    if (scene === 'plants' && object.id === 'rug')
      return { ...object, color: '#99ae95' }
    return object
  })
  if (scene === 'plants')
    objects.push({
      id: 'plant-extra',
      kind: 'plant',
      x: 136,
      y: 369,
      w: 87,
      h: 90,
      color: '#48705a',
    })
  return objects
}
