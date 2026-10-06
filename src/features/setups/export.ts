import { parseSetups } from './storage'
import type { SavedSetup } from './storage'

export const MAX_IMPORT_BYTES = 200_000
export function filename(name: string) {
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)
      .toLowerCase() || 'roomlab-setup'
  )
}
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function exportJson(setup: SavedSetup) {
  download(
    new Blob([JSON.stringify({ version: 1, setups: [setup] }, null, 2)], {
      type: 'application/json',
    }),
    `${filename(setup.name)}.roomlab.json`,
  )
}
export async function importJson(file: File) {
  if (file.size > MAX_IMPORT_BYTES)
    throw new Error('Escolha um arquivo RoomLab de até 200 KB.')
  let setups: SavedSetup[]
  try {
    setups = parseSetups(await file.text())
  } catch {
    throw new Error(
      'Arquivo RoomLab inválido ou de uma versão não suportada. Seus setups existentes foram preservados. Escolha um backup exportado pelo editor.',
    )
  }
  if (setups.length !== 1)
    throw new Error(
      'Escolha um arquivo exportado pelo editor com apenas um setup.',
    )
  return setups[0]
}
export async function exportPng(svg: SVGSVGElement, name: string) {
  const copy = svg.cloneNode(true) as SVGSVGElement
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  copy.setAttribute('width', '1520')
  copy.setAttribute('height', '1220')
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(copy)], {
      type: 'image/svg+xml',
    }),
  )
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 1520
    canvas.height = 1220
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas indisponível')
    context.fillStyle = '#e8edf2'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png'),
    )
    if (!blob) throw new Error('Imagem indisponível')
    download(blob, `${filename(name)}.png`)
  } finally {
    URL.revokeObjectURL(url)
  }
}
