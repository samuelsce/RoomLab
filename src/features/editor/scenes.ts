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
  attachedTo?: string
}
const base: SceneObject[] = [
  { id: 'rug', kind: 'rug', x: 206, y: 262, w: 316, h: 210, color: '#8da5b1' },
  {
    id: 'shelf',
    kind: 'shelf',
    x: 466,
    y: 103,
    w: 152,
    h: 55,
    color: '#b78d60',
  },
  {
    id: 'desk',
    kind: 'desk',
    x: 169,
    y: 143,
    w: 270,
    h: 115,
    color: '#b78d60',
  },
  { id: 'pc', kind: 'pc', x: 379, y: 162, w: 46, h: 68, color: '#334452' },
  {
    id: 'monitor',
    kind: 'monitor',
    x: 245,
    y: 159,
    w: 102,
    h: 42,
    color: '#334452',
  },
  {
    id: 'keyboard',
    kind: 'keyboard',
    x: 262,
    y: 214,
    w: 72,
    h: 28,
    color: '#eeeae2',
  },
  { id: 'lamp', kind: 'lamp', x: 190, y: 176, w: 42, h: 42, color: '#d5a14c' },
  {
    id: 'chair',
    kind: 'chair',
    x: 254,
    y: 271,
    w: 95,
    h: 95,
    color: '#334452',
  },
  {
    id: 'plant',
    kind: 'plant',
    x: 513,
    y: 360,
    w: 95,
    h: 95,
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
        h: 110,
        color: '#283548',
      },
      {
        id: 'monitor',
        kind: 'dual-monitor',
        x: 209,
        y: 150,
        w: 143,
        h: 40,
        color: '#192639',
      },
      { id: 'pc', kind: 'pc', x: 363, y: 153, w: 50, h: 70, color: '#192639' },
      {
        id: 'keyboard',
        kind: 'keyboard',
        x: 238,
        y: 204,
        w: 78,
        h: 27,
        color: '#283548',
      },
      {
        id: 'chair',
        kind: 'chair',
        x: 229,
        y: 269,
        w: 98,
        h: 98,
        color: '#283548',
      },
      {
        id: 'lamp',
        kind: 'lamp',
        x: 157,
        y: 161,
        w: 42,
        h: 42,
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
        h: 55,
        color: '#283548',
      },
    ]
  const objects = base.map<SceneObject>((object) => {
    if (scene === 'dual' && object.id === 'monitor')
      return { ...object, kind: 'dual-monitor', x: 223, w: 148, h: 42 }
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
