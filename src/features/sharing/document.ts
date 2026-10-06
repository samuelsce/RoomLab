import { parseSetups } from '../setups/storage.ts'
import type { SceneName, SceneObject } from '../editor/scenes.ts'
import type { RoomAppearance } from '../editor/appearance.ts'

export const MAX_SHARE_BYTES = 64_000
export interface SharedDocument {
  schemaVersion: 1
  name: string
  scene: SceneName
  objects: SceneObject[]
  appearance?: RoomAppearance
}
export function validateSharedDocument(value: unknown): SharedDocument {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Documento inválido.')
  const data = value as Record<string, unknown>
  if (data.schemaVersion !== 1)
    throw new Error('Versão do documento não suportada.')
  const date = '2026-01-01T00:00:00.000Z'
  try {
    const setup = parseSetups(
      JSON.stringify({
        version: 1,
        setups: [
          {
            id: 'snapshot',
            revision: 'snapshot',
            createdAt: date,
            updatedAt: date,
            name: data.name,
            scene: data.scene,
            objects: data.objects,
            appearance: data.appearance,
          },
        ],
      }),
    )[0]
    return {
      schemaVersion: 1,
      name: setup.name,
      scene: setup.scene,
      objects: setup.objects,
      ...(setup.appearance ? { appearance: setup.appearance } : {}),
    }
  } catch {
    throw new Error(
      'O quarto contém dados inválidos. Confira o nome e as peças.',
    )
  }
}
