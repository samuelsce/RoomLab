import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('3D inspiration switches scenes, light and camera with reduced motion', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const canvas = page.getByRole('img', { name: 'Visualização 3D do quarto' })
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  await expect(canvas).toHaveAttribute('data-scene', 'gamer')
  const initial = await canvas.evaluate((node) => {
    node.dispatchEvent(new Event('roomlab:snapshot'))
    return (node as HTMLCanvasElement).toDataURL()
  })
  const difference = () =>
    canvas.evaluate(async (node, original) => {
      const source = node as HTMLCanvasElement
      source.dispatchEvent(new Event('roomlab:snapshot'))
      const raster = document.createElement('canvas')
      raster.width = source.width
      raster.height = source.height
      const context = raster.getContext('2d')!
      context.drawImage(source, 0, 0)
      const current = context.getImageData(
        0,
        0,
        raster.width,
        raster.height,
      ).data
      const image = new Image()
      image.src = original
      await image.decode()
      context.clearRect(0, 0, raster.width, raster.height)
      context.drawImage(image, 0, 0)
      const previous = context.getImageData(
        0,
        0,
        raster.width,
        raster.height,
      ).data
      let changed = 0,
        samples = 0
      for (let i = 0; i < current.length; i += 64) {
        changed +=
          Math.abs(current[i] - previous[i]) +
          Math.abs(current[i + 1] - previous[i + 1]) +
          Math.abs(current[i + 2] - previous[i + 2])
        samples += 3
      }
      return changed / (samples * 255)
    }, initial)
  await page.getByRole('button', { name: 'Girar vista para a direita' }).focus()
  await page.keyboard.press('Enter')
  await expect.poll(difference).toBeGreaterThan(0.002)
  await page.getByRole('button', { name: 'Restaurar vista 3D' }).click()
  await expect.poll(difference).toBeLessThan(0.001)
  await page.getByRole('button', { name: 'Luz noturna', exact: true }).click()
  await expect(page.locator('.room-preview')).not.toHaveClass(
    /room-preview-night/,
  )
  await page.getByRole('button', { name: 'Com plantas', exact: true }).click()
  await expect(canvas).toHaveAttribute('data-scene', 'plants')
  await expect(
    page.getByRole('link', { name: 'Montar meu setup', exact: true }),
  ).toHaveAttribute('href', '/editor?scene=plants')
  await page.screenshot({
    path: testInfo.outputPath('studio.png'),
    fullPage: true,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  expect(errors).toEqual([])
})

test('gamer bed edits, view changes and 3D PNG preserve the actual composition', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/editor?scene=gamer')
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  const properties = page.getByRole('button', {
    name: 'Propriedades',
    exact: true,
  })
  if (await properties.isVisible()) await properties.click()
  await page
    .getByRole('button', { name: 'Editar cama na lista', exact: true })
    .click()
  const canvas = page.getByRole('img', { name: 'Visualização 3D do quarto' })
  const before = await canvas.screenshot()
  await page.getByRole('button', { name: 'Cor Verde', exact: true }).click()
  await expect
    .poll(async () => (await canvas.screenshot()).equals(before))
    .toBe(false)
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await page.reload()
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  await page.getByRole('button', { name: 'Planta 2D', exact: true }).click()
  await expect(
    page.locator('[data-object-id="bed"] rect[fill="#48705a"]').first(),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Ver em 3D', exact: true }).click()
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar PNG', exact: true }).click()
  const download = await pending
  expect(download.suggestedFilename()).toBe('quarto-gamer-3d.png')
  const path = testInfo.outputPath('quarto-3d.png')
  await download.saveAs(path)
  const bytes = await readFile(path)
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  const diversity = await page.evaluate(async (data) => {
    const image = new Image()
    image.src = `data:image/png;base64,${data}`
    await image.decode()
    const raster = document.createElement('canvas')
    raster.width = image.width
    raster.height = image.height
    const context = raster.getContext('2d')!
    context.drawImage(image, 0, 0)
    const pixels = context.getImageData(0, 0, raster.width, raster.height).data
    const colors = new Set<string>()
    for (let i = 0; i < pixels.length; i += 16)
      colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`)
    return colors.size
  }, bytes.toString('base64'))
  expect(diversity).toBeGreaterThan(200)
})

test('devices without WebGL retain an editable plan and local saving', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type.startsWith('webgl') || type === 'experimental-webgl')
          return null
        return Reflect.apply(original, this, [type, ...args])
      },
    })
  })
  await page.setViewportSize({ width: 320, height: 780 })
  await page.goto('/editor?scene=gamer')
  await expect(
    page.getByText(
      'Visualização em planta. O 3D não está disponível neste dispositivo.',
    ),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Planta 2D', exact: true }).click()
  const catalog = page.getByRole('button', { name: 'Catálogo', exact: true })
  if (await catalog.isVisible()) await catalog.click()
  await page
    .getByRole('button', { name: 'Adicionar planta', exact: true })
    .click()
  await expect(page.getByText('11 objetos', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Planta 2D', exact: true }).click()
  await expect(page.locator('[data-object-id]')).toHaveCount(11)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})
