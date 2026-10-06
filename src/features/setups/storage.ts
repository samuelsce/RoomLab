import { catalog } from '../catalog/catalog.ts'
import { MAX_OBJECTS } from '../editor/editorModel.ts'
import { constrainObject } from '../editor/geometry.ts'
import type { SceneName, SceneObject } from '../editor/scenes.ts'
import { parseAppearance } from '../editor/appearance.ts'
import type { RoomAppearance } from '../editor/appearance.ts'
import { isDesk, isEquipment } from '../editor/surfaces.ts'

export const STORAGE_KEY = 'roomlab.setups.v1'
export const MAX_SETUPS = 30
export interface SavedSetup {
  id: string
  name: string
  scene: SceneName
  objects: SceneObject[]
  appearance?: RoomAppearance
  createdAt: string
  updatedAt: string
  revision: string
}
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>
export class SetupStorageError extends Error {}

const invalid = () => {
  throw new SetupStorageError(
    'Os dados salvos não puderam ser lidos. Eles foram preservados. Tente recuperar o armazenamento do navegador antes de salvar novamente.',
  )
}
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const text = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max
const date = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value))

export function parseSetups(raw: string | null): SavedSetup[] {
  if (raw === null) return []
  try {
    const data: unknown = JSON.parse(raw)
    if (!record(data) || data.version !== 1 || !Array.isArray(data.setups))
      return invalid()
    if (data.setups.length > MAX_SETUPS) return invalid()
    const ids = new Set<string>()
    return data.setups.map((setup: unknown) => {
      if (
        !record(setup) ||
        !text(setup.id, 100) ||
        ids.has(setup.id) ||
        !text(setup.name, 60) ||
        !text(setup.revision, 100) ||
        !date(setup.createdAt) ||
        !date(setup.updatedAt) ||
        typeof setup.scene !== 'string' ||
        !['study', 'dual', 'plants', 'gamer', 'empty'].includes(setup.scene) ||
        !Array.isArray(setup.objects) ||
        setup.objects.length > MAX_OBJECTS
      )
        return invalid()
      ids.add(setup.id)
      const objectIds = new Set<string>()
      const objects = setup.objects.map((object: unknown): SceneObject => {
        if (
          !record(object) ||
          !text(object.id, 100) ||
          objectIds.has(object.id) ||
          !catalog.some((item) => item.id === object.kind) ||
          !['x', 'y', 'w', 'h'].every(
            (key) =>
              typeof object[key] === 'number' && Number.isFinite(object[key]),
          ) ||
          Number(object.w) <= 0 ||
          Number(object.h) <= 0 ||
          typeof object.color !== 'string' ||
          !/^#[\da-f]{6}$/i.test(object.color) ||
          (object.rotation !== undefined &&
            (typeof object.rotation !== 'number' ||
              !Number.isFinite(object.rotation))) ||
          (object.attachedTo !== undefined && !text(object.attachedTo, 100))
        )
          return invalid()
        objectIds.add(object.id)
        return constrainObject({
          id: object.id,
          kind: object.kind as SceneObject['kind'],
          x: object.x as number,
          y: object.y as number,
          w: object.w as number,
          h: object.h as number,
          color: object.color,
          rotation: (object.rotation as number | undefined) ?? 0,
          ...(object.attachedTo !== undefined
            ? { attachedTo: object.attachedTo as string }
            : {}),
        })
      })
      for (const object of objects) {
        if (object.attachedTo === undefined) continue
        const desk = objects.find((item) => item.id === object.attachedTo)
        if (
          !isEquipment(object) ||
          !desk ||
          !isDesk(desk) ||
          desk.attachedTo !== undefined
        )
          return invalid()
      }
      return {
        id: setup.id,
        name: setup.name.trim(),
        scene: setup.scene as SceneName,
        objects,
        ...(setup.appearance !== undefined
          ? { appearance: parseAppearance(setup.appearance) }
          : {}),
        createdAt: setup.createdAt,
        updatedAt: setup.updatedAt,
        revision: setup.revision,
      }
    })
  } catch (error) {
    if (error instanceof SetupStorageError) throw error
    return invalid()
  }
}

export function readSetups(storage: StoragePort): SavedSetup[] {
  try {
    return parseSetups(storage.getItem(STORAGE_KEY))
  } catch (error) {
    if (error instanceof SetupStorageError) throw error
    throw new SetupStorageError(
      'O navegador bloqueou o acesso aos setups. Permita o armazenamento local para abrir e salvar seus quartos.',
    )
  }
}
function writeSetups(storage: StoragePort, setups: SavedSetup[]) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, setups }))
  } catch {
    throw new SetupStorageError(
      'Não foi possível salvar. O armazenamento pode estar cheio ou bloqueado. Seu quarto continua aberto; libere espaço ou permita o armazenamento e tente novamente.',
    )
  }
}
export function saveSetup(
  storage: StoragePort,
  setup: SavedSetup,
  expectedRevision: string | null,
) {
  const setups = readSetups(storage)
  const existing = setups.find((item) => item.id === setup.id)
  if ((existing?.revision ?? null) !== expectedRevision)
    throw new SetupStorageError(
      'Este setup foi alterado ou excluído em outra aba. Salve uma cópia para preservar suas alterações.',
    )
  if (!existing && setups.length >= MAX_SETUPS)
    throw new SetupStorageError(
      `Você já tem ${MAX_SETUPS} setups. Exclua um na lista para salvar outro.`,
    )
  const checked = parseSetups(
    JSON.stringify({ version: 1, setups: [setup] }),
  )[0]
  writeSetups(
    storage,
    existing
      ? setups.map((item) => (item.id === setup.id ? checked : item))
      : [...setups, checked],
  )
  return checked
}
export function deleteSetup(
  storage: StoragePort,
  id: string,
  expectedRevision: string,
) {
  const setups = readSetups(storage)
  if (setups.find((item) => item.id === id)?.revision !== expectedRevision)
    throw new SetupStorageError(
      'Este setup mudou em outra aba. Atualize a lista antes de excluir.',
    )
  writeSetups(
    storage,
    setups.filter((item) => item.id !== id),
  )
}
export function storageMessage(error: unknown) {
  if (error instanceof Error && error.name === 'SecurityError')
    return 'O navegador bloqueou o armazenamento local. Permita o acesso aos dados do site e tente novamente.'
  return error instanceof SetupStorageError
    ? error.message
    : 'Não foi possível acessar os setups. Tente novamente.'
}
