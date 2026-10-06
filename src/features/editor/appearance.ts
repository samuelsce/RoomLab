import type { SceneName } from './scenes.ts'

export const floors = {
  oak: {
    name: 'Carvalho',
    colors: ['#c6ab88', '#d4b995', '#cdb18c'],
    base: '#b19474',
    plan: '#e0cfb6',
    line: '#c7b393',
    roughness: 0.78,
  },
  smoked: {
    name: 'Madeira cinza',
    colors: ['#7c7169', '#8a7f75', '#84796f'],
    base: '#29364b',
    plan: '#a49d97',
    line: '#756e66',
    roughness: 0.82,
  },
  walnut: {
    name: 'Nogueira',
    colors: ['#775b49', '#846552', '#8e705b'],
    base: '#5c4639',
    plan: '#a78266',
    line: '#72523c',
    roughness: 0.72,
  },
  stone: {
    name: 'Pedra clara',
    colors: ['#b5bdc3', '#c0c7cb', '#b9c2c7'],
    base: '#87959e',
    plan: '#c6cfd4',
    line: '#9ca9b2',
    roughness: 0.94,
  },
} as const
export interface RoomAppearance {
  wall: string
  floor: keyof typeof floors
}
export const wallPaints = [
  { name: 'Névoa', color: '#e3e8e4' },
  { name: 'Marfim', color: '#eee6d7' },
  { name: 'Sálvia', color: '#889f93' },
  { name: 'Argila', color: '#bd8c78' },
  { name: 'Azul profundo', color: '#34425b' },
  { name: 'Grafite', color: '#41464e' },
] as const
export function defaultAppearance(scene: SceneName): RoomAppearance {
  return {
    wall: scene === 'gamer' ? '#34425b' : '#e3e8e4',
    floor: scene === 'gamer' ? 'smoked' : 'oak',
  }
}
export function parseAppearance(value: unknown): RoomAppearance {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw Error('Ambiente inválido.')
  const data = value as Record<string, unknown>
  if (
    typeof data.wall !== 'string' ||
    !/^#[\da-f]{6}$/i.test(data.wall) ||
    typeof data.floor !== 'string' ||
    !Object.hasOwn(floors, data.floor)
  )
    throw Error('Ambiente inválido.')
  return {
    wall: data.wall.toLowerCase(),
    floor: data.floor as RoomAppearance['floor'],
  }
}
