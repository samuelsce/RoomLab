import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

async function selectByKeyboard(page: Page, name: string) {
  await page
    .getByRole('button', { name: `Selecionar ${name}`, exact: true })
    .focus()
  await page.keyboard.press('Enter')
}

async function drag(
  page: Page,
  target: Locator,
  dx: number,
  dy: number,
  cancel = false,
) {
  await target.scrollIntoViewIfNeeded()
  const box = await target.boundingBox()
  if (!box) throw new Error('Missing drag target')
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + dx, y + dy, { steps: 8 })
  if (cancel) await page.keyboard.press('Escape')
  await page.mouse.up()
}

test('create personalize duplicate delete undo and redo a setup', async ({
  page,
}) => {
  await page.goto('/editor?scene=empty')
  await page
    .getByRole('button', { name: 'Adicionar mesa', exact: true })
    .click()
  const width = page.getByRole('spinbutton', { name: 'Largura', exact: true })
  await width.fill('180')
  await width.press('Enter')
  await expect(width).toHaveValue('180')
  await page.getByRole('button', { name: 'Girar 90°' }).click()
  await expect(
    page.getByRole('spinbutton', { name: 'Rotação (°)' }),
  ).toHaveValue('90')
  await page.getByRole('button', { name: 'Cor Verde', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Cor Verde', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page
      .locator(
        '[data-testid="editable-room"] g[data-object-id] rect[fill="#48705a"]',
      )
      .first(),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Duplicar', exact: true }).click()
  await expect(page.getByText('2 objetos', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Excluir', exact: true }).click()
  await expect(page.getByText('1 objeto', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(page.getByText('2 objetos', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Refazer', exact: true }).click()
  await expect(page.getByText('1 objeto', { exact: true })).toBeVisible()
})

test('pointer movement follows zoom and is one undo action; Escape cancels a gesture', async ({
  page,
}) => {
  await page.goto('/editor')
  await selectByKeyboard(page, 'planta')
  const position = page.getByRole('spinbutton', { name: 'Posição X' })
  const startX = Number(await position.inputValue())
  await page.getByRole('button', { name: 'Aumentar zoom' }).click()
  await page.getByRole('button', { name: 'Aumentar zoom' }).click()
  const svg = page.getByTestId('editable-room')
  const scale = await svg.evaluate(
    (element) => (element as unknown as SVGSVGElement).getScreenCTM()!.a,
  )
  const plant = page.getByRole('button', {
    name: 'Selecionar planta',
    exact: true,
  })
  await drag(page, plant, -40 * scale, -20 * scale)
  await expect(position).toHaveValue(String(startX - 40))
  await expect(page.getByRole('button', { name: 'Desfazer' })).toBeEnabled()
  await page.getByRole('button', { name: 'Desfazer' }).click()
  await expect(position).toHaveValue(String(startX))
  await expect(page.getByRole('button', { name: 'Desfazer' })).toBeDisabled()
  await page.getByRole('button', { name: 'Refazer' }).click()
  await expect(position).toHaveValue(String(startX - 40))
  await drag(page, plant, -20 * scale, 0, true)
  await expect(position).toHaveValue(String(startX - 40))
  await expect(
    page.getByRole('button', { name: 'Aumentar zoom' }),
  ).toBeEnabled()
})

test('resize corner and numeric controls respect limits without trapping keyboard input', async ({
  page,
}) => {
  await page.goto('/editor')
  await selectByKeyboard(page, 'planta')
  const width = page.getByRole('spinbutton', { name: 'Largura' })
  const before = Number(await width.inputValue())
  const scale = await page
    .getByTestId('editable-room')
    .evaluate(
      (element) => (element as unknown as SVGSVGElement).getScreenCTM()!.a,
    )
  await drag(
    page,
    page.getByRole('button', { name: 'Redimensionar planta', exact: true }),
    20 * scale,
    10 * scale,
  )
  await expect(width).toHaveValue(String(before + 20))
  await page.getByRole('button', { name: 'Desfazer' }).click()
  await expect(width).toHaveValue(String(before))
  await width.fill('-100')
  await width.press('Enter')
  await expect(width).toHaveValue('40')
  await width.fill('9999')
  await width.press('Enter')
  await expect(width).toHaveValue('200')
  await width.fill('60')
  await width.press('Escape')
  await expect(width).toHaveValue('200')
  await width.fill('')
  await width.press('Tab')
  await expect(width).toHaveValue('200')
  await width.fill('100')
  await width.press('Control+z')
  await expect(page.getByText('10 objetos', { exact: true })).toBeVisible()
})

test('layer order and grid are independent from selection and viewport history', async ({
  page,
}) => {
  await page.goto('/editor')
  await selectByKeyboard(page, 'tapete')
  const drawnObjects = page.locator(
    '[data-testid="editable-room"] > g[data-object-id]',
  )
  await page
    .getByRole('button', { name: 'Trazer para frente', exact: true })
    .click()
  await expect(drawnObjects.last()).toHaveAttribute('data-object-id', 'rug')
  await page.getByRole('button', { name: 'Desfazer' }).click()
  await expect(drawnObjects.first()).toHaveAttribute('data-object-id', 'rug')
  await page.getByRole('button', { name: 'Grade', exact: true }).click()
  await page.getByRole('button', { name: 'Aumentar zoom' }).click()
  await expect(page.getByRole('button', { name: 'Desfazer' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Refazer' })).toBeEnabled()
  await expect(
    page.getByRole('button', { name: 'Grade', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Refazer' }).click()
  await expect(drawnObjects.last()).toHaveAttribute('data-object-id', 'rug')
})

test('touch drag moves the object without scrolling and catalog tap adds an object', async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Touch profile only')
  await page.goto('/editor')
  const plant = page.getByRole('button', {
    name: 'Selecionar planta',
    exact: true,
  })
  await page.evaluate(() => document.fonts.ready)
  const box = await plant.boundingBox()
  if (!box) throw new Error('Missing plant')
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  const scale = await page
    .getByTestId('editable-room')
    .evaluate(
      (element) => (element as unknown as SVGSVGElement).getScreenCTM()!.a,
    )
  const scrollBefore = await page.evaluate(() => window.scrollY)
  const session = await context.newCDPSession(page)
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y, id: 1 }],
  })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: x - 30 * scale, y, id: 1 }],
  })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore)
  await expect(page.getByRole('spinbutton', { name: 'Posição X' })).toHaveValue(
    '483',
  )
  await page.getByRole('button', { name: 'Catálogo', exact: true }).tap()
  await expect(
    page.getByRole('button', { name: 'Catálogo', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page
    .getByRole('button', { name: 'Adicionar planta', exact: true })
    .tap()
  await expect(page.getByText('11 objetos', { exact: true })).toBeVisible()
  await session.detach()
})

test('grid snapping, outside release and a twenty-object scene remain editable', async ({
  page,
}) => {
  await page.goto('/editor?scene=empty')
  await page
    .getByRole('button', { name: 'Adicionar mesa', exact: true })
    .click()
  for (let i = 0; i < 19; i++)
    await page.getByRole('button', { name: 'Duplicar', exact: true }).click()
  await expect(page.getByText('20 objetos', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Grade', exact: true }).click()
  const selected = page.locator(
    '[data-testid="editable-room"] .scene-hit-area[aria-pressed="true"]',
  )
  const scale = await page
    .getByTestId('editable-room')
    .evaluate(
      (element) => (element as unknown as SVGSVGElement).getScreenCTM()!.a,
    )
  await drag(page, selected, -67 * scale, -31 * scale)
  const x = Number(
    await page.getByRole('spinbutton', { name: 'Posição X' }).inputValue(),
  )
  const y = Number(
    await page.getByRole('spinbutton', { name: 'Posição Y' }).inputValue(),
  )
  expect((x - 119) % 10).toBe(0)
  expect((y - 94) % 10).toBe(0)
  await drag(page, selected, -2000, -2000)
  await expect(page.getByRole('spinbutton', { name: 'Posição X' })).toHaveValue(
    '119',
  )
  await expect(page.getByRole('spinbutton', { name: 'Posição Y' })).toHaveValue(
    '94',
  )
  await expect(
    page.getByRole('button', { name: 'Aumentar zoom' }),
  ).toBeEnabled()
  await page.getByRole('button', { name: 'Excluir', exact: true }).click()
  await expect(page.getByText('19 objetos', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Desfazer' }).click()
  await expect(page.getByText('20 objetos', { exact: true })).toBeVisible()
})

test('catalog drop creates an object at the room point; dropping outside does not add', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop drag and drop')
  await page.goto('/editor?scene=empty')
  await page
    .getByRole('button', { name: 'Adicionar planta', exact: true })
    .dragTo(page.getByTestId('editable-room'), {
      targetPosition: { x: 340, y: 260 },
    })
  await expect(page.getByText('1 objeto', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Desfazer' }).click()
  await expect(page.getByText('0 objetos', { exact: true })).toBeVisible()
  await page
    .getByRole('button', { name: 'Adicionar planta', exact: true })
    .dragTo(page.getByTestId('editable-room'), {
      targetPosition: { x: 10, y: 10 },
    })
  await expect(page.getByText('0 objetos', { exact: true })).toBeVisible()
})
