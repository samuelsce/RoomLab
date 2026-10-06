import { expect, test } from '@playwright/test'
import type { Locator } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function clickBed(canvas: Locator) {
  const box = await canvas.boundingBox()
  if (!box) throw new Error('Room canvas is not visible')
  await canvas.click({
    position: { x: box.width * 0.62, y: box.height * 0.5 },
  })
}

test('selecting furniture in 3D shares properties, history and a clean PNG with the plan', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/editor?scene=gamer')
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  const canvas = page.getByRole('img', { name: 'Visualização 3D do quarto' })
  await clickBed(canvas)
  await expect(
    page.getByRole('heading', { name: 'Cama', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Editar cama na lista', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('button', { name: 'Desfazer', exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole('spinbutton', { name: 'Profundidade', exact: true }),
  ).toHaveValue('231')
  await page.getByRole('button', { name: 'Cor Verde', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Desfazer', exact: true }),
  ).toBeEnabled()
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar PNG', exact: true }).click()
  const download = await pending
  const path = testInfo.outputPath('selected-room.png')
  await download.saveAs(path)
  const exported = (await readFile(path)).toString('base64')
  await page
    .getByRole('button', { name: 'Limpar seleção', exact: true })
    .click()
  const differingPixels = await canvas.evaluate(async (element, encoded) => {
    const image = new Image()
    image.src = `data:image/png;base64,${encoded}`
    await image.decode()
    element.dispatchEvent(new Event('roomlab:snapshot'))
    const source = element as HTMLCanvasElement
    const raster = document.createElement('canvas')
    raster.width = source.width
    raster.height = source.height
    const context = raster.getContext('2d')!
    context.fillStyle = getComputedStyle(
      element.closest('.room-preview')!,
    ).backgroundColor
    context.fillRect(0, 0, raster.width, raster.height)
    context.drawImage(source, 0, 0)
    const expected = context.getImageData(
      0,
      0,
      raster.width,
      raster.height,
    ).data
    context.clearRect(0, 0, raster.width, raster.height)
    context.drawImage(image, 0, 0)
    const actual = context.getImageData(0, 0, raster.width, raster.height).data
    return actual.reduce(
      (count, value, index) => count + Number(value !== expected[index]),
      0,
    )
  }, exported)
  expect(
    differingPixels,
    'PNG must match the room with selection cleared',
  ).toBe(0)
  await page.getByRole('button', { name: 'Planta 2D', exact: true }).click()
  await expect(
    page.getByTestId('editable-room').getByText('522 u', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByTestId('editable-room').getByText('410 u', { exact: true }),
  ).toBeVisible()
  await expect(
    page.locator('[data-object-id="bed"] rect[fill="#48705a"]').first(),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(
    page.locator('[data-object-id="bed"] rect[fill="#657391"]').first(),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Refazer', exact: true }).click()
  await expect(
    page.locator('[data-object-id="bed"] rect[fill="#48705a"]').first(),
  ).toBeVisible()
})

test('camera gestures retain selection and background or Escape clear it without changing the room', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/editor?scene=gamer')
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  const canvas = page.getByRole('img', { name: 'Visualização 3D do quarto' })
  await canvas.scrollIntoViewIfNeeded()
  const box = (await canvas.boundingBox())!
  const before = await canvas.screenshot()
  await page.mouse.move(box.x + box.width * 0.68, box.y + box.height * 0.53)
  await page.mouse.down()
  await page.mouse.move(
    box.x + box.width * 0.68 - 65,
    box.y + box.height * 0.53,
    { steps: 8 },
  )
  await page.mouse.up()
  await expect(canvas).toHaveAttribute('data-selected-id', 'desk')
  await expect
    .poll(async () => (await canvas.screenshot()).equals(before))
    .toBe(false)
  await expect(
    page.getByRole('button', { name: 'Desfazer', exact: true }),
  ).toBeDisabled()
  await page.getByRole('button', { name: 'Restaurar vista 3D' }).click()
  await clickBed(canvas)
  await expect(canvas).toHaveAttribute('data-selected-id', 'bed')
  await canvas.click({
    position: {
      x: (await canvas.boundingBox())!.width * 0.95,
      y: (await canvas.boundingBox())!.height * 0.97,
    },
  })
  await expect(canvas).not.toHaveAttribute('data-selected-id')
  await clickBed(canvas)
  await expect(canvas).toHaveAttribute('data-selected-id', 'bed')
  await canvas.focus()
  await page.keyboard.press('Escape')
  await expect(canvas).not.toHaveAttribute('data-selected-id')
  await expect(page.getByText('10 objetos', { exact: true })).toBeVisible()
  await page.goto('/')
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  await page.getByRole('img', { name: 'Visualização 3D do quarto' }).click()
  await expect(
    page.getByRole('button', { name: 'Limpar seleção' }),
  ).toHaveCount(0)
  await expect(page.locator('.room-selection')).toHaveCount(0)
})

test('real touch selects furniture while camera drag, multiple fingers and cancellation do not', async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Touch profile only')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/editor?scene=gamer')
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  const canvas = page.getByRole('img', { name: 'Visualização 3D do quarto' })
  await canvas.scrollIntoViewIfNeeded()
  const session = await context.newCDPSession(page)
  let box = (await canvas.boundingBox())!
  const bed = () => ({
    x: box.x + box.width * 0.62,
    y: box.y + box.height * 0.5,
  })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [bed()],
  })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  await expect(canvas).toHaveAttribute('data-selected-id', 'bed')
  await expect(
    page.getByRole('heading', { name: 'Propriedades', exact: true }),
  ).toBeFocused()
  await page.getByRole('button', { name: 'Limpar seleção' }).click()
  box = (await canvas.boundingBox())!
  const scroll = await page.evaluate(() => scrollY)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [bed()],
  })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: bed().x - 50, y: bed().y }],
  })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  await expect(canvas).not.toHaveAttribute('data-selected-id')
  expect(await page.evaluate(() => scrollY)).toBe(scroll)
  await page.getByRole('button', { name: 'Restaurar vista 3D' }).click()
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { ...bed(), id: 1 },
      { x: bed().x - 35, y: bed().y, id: 2 },
    ],
  })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  await expect(canvas).not.toHaveAttribute('data-selected-id')
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [bed()],
  })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchCancel',
    touchPoints: [],
  })
  await expect(canvas).not.toHaveAttribute('data-selected-id')
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [bed()],
  })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  await expect(canvas).toHaveAttribute('data-selected-id', 'bed')
})
