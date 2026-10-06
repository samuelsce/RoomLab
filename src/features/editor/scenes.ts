import type { ObjectKind } from '../catalog/catalog'

export type SceneName = 'study' | 'dual' | 'plants' | 'gamer' | 'empty'
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
  if (scene === 'gamer')
    return [
      {
        id: 'rug',
        kind: 'rug',
        x: 153,
        y: 281,
        w: 260,
        h: 194,
        color: '#35435c',
      },
      {
        id: 'desk',
        kind: 'desk',
        x: 149,
        y: 135,
        w: 285,
        h: 134,
        color: '#283548',
      },
      {
        id: 'monitor',
        kind: 'dual-monitor',
        x: 209,
        y: 150,
        w: 143,
        h: 68,
        color: '#192639',
      },
      { id: 'pc', kind: 'pc', x: 363, y: 155, w: 55, h: 82, color: '#192639' },
      {
        id: 'keyboard',
        kind: 'keyboard',
        x: 238,
        y: 222,
        w: 94,
        h: 32,
        color: '#283548',
      },
      {
        id: 'chair',
        kind: 'chair',
        x: 219,
        y: 289,
        w: 115,
        h: 116,
        color: '#283548',
      },
      {
        id: 'lamp',
        kind: 'lamp',
        x: 157,
        y: 161,
        w: 48,
        h: 58,
        color: '#927cf6',
      },
      {
        id: 'frame',
        kind: 'frame',
        x: 265,
        y: 96,
        w: 93,
        h: 40,
        color: '#59dcd6',
      },
      {
        id: 'bed',
        kind: 'bed',
        x: 456,
        y: 251,
        w: 164,
        h: 231,
        color: '#657391',
      },
      {
        id: 'shelf',
        kind: 'shelf',
        x: 457,
        y: 125,
        w: 158,
        h: 66,
        color: '#283548',
      },
    ]
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
