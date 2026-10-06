import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseSetups,
  readSetups,
  saveSetup,
  deleteSetup,
  STORAGE_KEY,
  MAX_SETUPS,
} from '../src/features/setups/storage.ts'
import type { SavedSetup, StoragePort } from '../src/features/setups/storage.ts'
import { createObject } from '../src/features/editor/editorModel.ts'

function memory() {
  const data = new Map<string, string>()
  const storage: StoragePort = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
  }
  return { data, storage }
}
function setup(id = 'one', revision = 'v1'): SavedSetup {
  return {
    id,
    revision,
    name: 'Meu quarto',
    scene: 'empty',
    objects: [createObject('desk', 'desk', 0)],
    createdAt: '2026-10-06T12:00:00.000Z',
    updatedAt: '2026-10-06T12:00:00.000Z',
  }
}
test('round trip preserves document, colors, layers and normalized transforms', () => {
  const { storage } = memory()
  const document = setup()
  document.objects.push({
    ...createObject('plant', 'plant', 1),
    rotation: 45,
    color: '#48705a',
  })
  const saved = saveSetup(storage, document, null)
  assert.deepEqual(readSetups(storage), [saved])
  assert.equal(saved.objects[1].rotation, 45)
  assert.equal(saved.objects[1].color, '#48705a')
  saveSetup(storage, { ...saved, name: 'Novo nome', revision: 'v2' }, 'v1')
  assert.equal(readSetups(storage).length, 1)
  assert.equal(readSetups(storage)[0].name, 'Novo nome')
  deleteSetup(storage, 'one', 'v2')
  assert.deepEqual(readSetups(storage), [])
})
test('invalid JSON, schema and unsafe object data never overwrite the original', () => {
  const { storage, data } = memory()
  const valid = setup()
  const variants: unknown[] = [
    null,
    { version: 2, setups: [] },
    { version: 1, setups: [valid, valid] },
    { version: 1, setups: [{ ...valid, scene: ['empty'] }] },
    {
      version: 1,
      setups: [
        { ...valid, objects: [{ ...valid.objects[0], kind: 'unknown' }] },
      ],
    },
    {
      version: 1,
      setups: [
        { ...valid, objects: [{ ...valid.objects[0], color: 'url(evil)' }] },
      ],
    },
    {
      version: 1,
      setups: [{ ...valid, objects: [{ ...valid.objects[0], x: null }] }],
    },
  ]
  for (const raw of [
    '{broken',
    ...variants.map((value) => JSON.stringify(value)),
  ]) {
    data.set(STORAGE_KEY, raw)
    assert.throws(() => saveSetup(storage, setup('new'), null))
    assert.equal(data.get(STORAGE_KEY), raw)
  }
  assert.deepEqual(parseSetups(null), [])
})
test('blocked storage and quota errors are actionable and preserve previous data', () => {
  assert.throws(
    () =>
      readSetups({
        getItem() {
          throw Error('blocked')
        },
        setItem() {},
      }),
    /bloqueou/,
  )
  const original = JSON.stringify({ version: 1, setups: [setup()] })
  const storage: StoragePort = {
    getItem: () => original,
    setItem() {
      throw Error('quota')
    },
  }
  assert.throws(
    () => saveSetup(storage, setup('two'), null),
    /cheio ou bloqueado/,
  )
  assert.equal(storage.getItem(STORAGE_KEY), original)
})
test('stale writes and deletes detect sequential changes in another tab', () => {
  const { storage } = memory()
  saveSetup(storage, setup(), null)
  saveSetup(storage, setup('one', 'v2'), 'v1')
  assert.throws(() => saveSetup(storage, setup('one', 'v3'), 'v1'), /outra aba/)
  assert.throws(() => deleteSetup(storage, 'one', 'v1'), /outra aba/)
  deleteSetup(storage, 'one', 'v2')
  assert.throws(() => saveSetup(storage, setup(), 'v2'), /outra aba/)
})
test('library limit rejects new documents while allowing an existing setup to update', () => {
  const { storage } = memory()
  for (let index = 0; index < MAX_SETUPS; index++)
    saveSetup(storage, setup(String(index)), null)
  assert.throws(() => saveSetup(storage, setup('extra'), null), /30 setups/)
  saveSetup(storage, setup('0', 'v2'), 'v1')
  assert.equal(readSetups(storage).length, MAX_SETUPS)
})
