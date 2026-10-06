import { test } from 'node:test'
import assert from 'node:assert/strict'
import { gzipSync } from 'node:zlib'
import { createObject } from '../src/features/editor/editorModel.ts'
import {
  encodeSharedDocument,
  decodeSharedDocument,
  buildShareUrl,
  MAX_SHARE_TOKEN,
} from '../src/features/sharing/codec.ts'
import {
  validateSharedDocument,
  MAX_SHARE_BYTES,
} from '../src/features/sharing/document.ts'
import type { SharedDocument } from '../src/features/sharing/document.ts'

const document = (): SharedDocument => ({
  schemaVersion: 1,
  name: 'Quarto do João 🌿',
  scene: 'empty',
  objects: [
    createObject('desk', 'desk', 0),
    { ...createObject('plant', 'plant', 1), rotation: 45 },
  ],
})
const tokenFor = (data: string | Uint8Array) =>
  `v1.${gzipSync(data).toString('base64url')}`
test('compressed round trip preserves unicode, layer order, colors and transforms', async () => {
  const original = validateSharedDocument(document())
  const token = await encodeSharedDocument(original)
  assert.match(token, /^v1\.[\w-]+$/)
  assert.deepEqual(await decodeSharedDocument(token), original)
  assert.ok(
    token.length <
      Buffer.from(JSON.stringify(original)).toString('base64url').length,
  )
})
test('shared schema excludes local IDs, revision, selection and unknown object fields', async () => {
  const original = document()
  const data = {
    ...original,
    id: 'local-secret',
    revision: 'revision',
    selectedId: 'desk',
    objects: original.objects.map((object) => ({
      ...object,
      secret: 'hidden',
    })),
  }
  const result = await decodeSharedDocument(await encodeSharedDocument(data))
  assert.deepEqual(
    Object.keys(result).sort(),
    ['name', 'objects', 'scene', 'schemaVersion'].sort(),
  )
  assert.equal('secret' in result.objects[0], false)
})
test('invalid names, object kinds, duplicate IDs and unsupported schema are rejected', () => {
  const original = document()
  for (const data of [
    null,
    { ...original, schemaVersion: 2 },
    { ...original, name: ' ' },
    { ...original, name: 'x'.repeat(61) },
    { ...original, objects: [original.objects[0], original.objects[0]] },
    { ...original, objects: [{ ...original.objects[0], kind: 'script' }] },
    { ...original, objects: [{ ...original.objects[0], color: 'url(evil)' }] },
  ])
    assert.throws(() => validateSharedDocument(data))
})
test('missing, malformed, truncated and future-version tokens fail with useful messages', async () => {
  const valid = await encodeSharedDocument(document())
  await assert.rejects(decodeSharedDocument(''), /incompleto/)
  await assert.rejects(decodeSharedDocument('v2.foo'), /versão/i)
  for (const token of [
    'v1.!bad',
    'v1.a',
    'v1.aaaa',
    valid.slice(0, -5),
    tokenFor('{broken'),
    tokenFor(Uint8Array.from([0xff, 0xfe])),
  ])
    await assert.rejects(decodeSharedDocument(token), /inválido|incompleto/)
})
test('token and decompressed byte limits reject oversized and highly compressed input', async () => {
  await assert.rejects(
    decodeSharedDocument('v1.' + 'a'.repeat(MAX_SHARE_TOKEN)),
    /limite/,
  )
  const bomb = tokenFor('a'.repeat(MAX_SHARE_BYTES + 1))
  assert.ok(bomb.length < MAX_SHARE_TOKEN)
  await assert.rejects(decodeSharedDocument(bomb), /limite/)
})
test('one hundred distinct objects fit within the link limit', async () => {
  const objects = Array.from({ length: 100 }, (_, index) => ({
    ...createObject(index % 2 ? 'plant' : 'desk', crypto.randomUUID(), index),
    color: index % 2 ? '#48705a' : '#b78d60',
    rotation: index % 360,
  }))
  const token = await encodeSharedDocument({ ...document(), objects })
  assert.ok(token.length <= MAX_SHARE_TOKEN)
  assert.equal((await decodeSharedDocument(token)).objects.length, 100)
})
test('Pages links keep payload in the hash and point to the repository root', () => {
  const pages = new URL(
    buildShareUrl('v1.test', 'https://samuelsce.github.io', '/RoomLab/', true),
  )
  assert.equal(pages.pathname, '/RoomLab/')
  assert.equal(pages.search, '')
  assert.equal(pages.hash, '#/setup?data=v1.test')
  assert.equal(
    buildShareUrl('v1.test', 'http://localhost:5173', '/', false),
    'http://localhost:5173/setup#data=v1.test',
  )
})
