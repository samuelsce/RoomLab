import { MAX_SHARE_BYTES, validateSharedDocument } from './document.ts'
import type { SharedDocument } from './document.ts'

export const MAX_SHARE_TOKEN = 12_000
export const SHARE_VERSION = 'v1.'
async function limitedBytes(stream: ReadableStream<Uint8Array>, limit: number) {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) {
        await reader.cancel()
        throw new Error('O quarto deste link ultrapassa o limite permitido.')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return bytes
}
function stream(bytes: Uint8Array<ArrayBuffer>) {
  return new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  })
}
export async function encodeSharedDocument(
  input: SharedDocument,
): Promise<string> {
  if (typeof CompressionStream === 'undefined')
    throw new Error(
      'Este navegador não consegue gerar links. Use a exportação JSON ou abra o RoomLab em um navegador atualizado.',
    )
  const document = validateSharedDocument(input)
  const bytes = new TextEncoder().encode(JSON.stringify(document))
  if (bytes.length > MAX_SHARE_BYTES)
    throw new Error(
      'Este quarto é grande demais para um link. Exporte JSON para compartilhá-lo.',
    )
  const compressed = await limitedBytes(
    stream(bytes).pipeThrough(new CompressionStream('gzip')),
    MAX_SHARE_BYTES,
  )
  const token =
    SHARE_VERSION +
    btoa(String.fromCharCode(...compressed))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  if (token.length > MAX_SHARE_TOKEN)
    throw new Error(
      'Este quarto é grande demais para um link. Exporte JSON para compartilhá-lo.',
    )
  return token
}
export async function decodeSharedDocument(
  token: string,
): Promise<SharedDocument> {
  if (!token)
    throw new Error(
      'O link está incompleto. Peça a quem enviou para copiar o endereço inteiro.',
    )
  if (token.length > MAX_SHARE_TOKEN)
    throw new Error('O link ultrapassa o limite permitido.')
  if (!token.startsWith(SHARE_VERSION))
    throw new Error(
      'Esta versão de link não é suportada. Peça um novo link gerado pelo RoomLab.',
    )
  const encoded = token.slice(SHARE_VERSION.length)
  if (!encoded || !/^[\w-]+$/.test(encoded) || encoded.length % 4 === 1)
    throw new Error(
      'O link está inválido ou incompleto. Peça o endereço inteiro.',
    )
  if (typeof DecompressionStream === 'undefined')
    throw new Error(
      'Este navegador não consegue abrir links de quartos. Tente um navegador atualizado.',
    )
  try {
    const compressed = Uint8Array.from(
      atob(encoded.replace(/-/g, '+').replace(/_/g, '/')),
      (char) => char.charCodeAt(0),
    )
    const bytes = await limitedBytes(
      stream(compressed).pipeThrough(new DecompressionStream('gzip')),
      MAX_SHARE_BYTES,
    )
    const data: unknown = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    )
    return validateSharedDocument(data)
  } catch (error) {
    if (
      error instanceof Error &&
      /limite|dados inválidos|versão/i.test(error.message)
    )
      throw error
    throw new Error(
      'O link está inválido ou incompleto. Peça a quem enviou para gerar um novo link.',
      { cause: error },
    )
  }
}
export function buildShareUrl(
  token: string,
  origin: string,
  base: string,
  hashRouter: boolean,
) {
  const root = new URL(base, origin)
  return hashRouter
    ? `${root.href}#/setup?data=${token}`
    : `${root.href}setup#data=${token}`
}
