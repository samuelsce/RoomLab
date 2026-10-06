import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

async function selectDesk(page: Page) {
  const properties = page.getByRole('button', {
    name: 'Propriedades',
    exact: true,
  })
  if (await properties.isVisible()) await properties.click()
  await page
    .getByRole('button', {
      name: 'Editar mesa de madeira na lista',
      exact: true,
    })
    .click()
}
async function finishes(page: Page) {
  await page
    .getByRole('button', { name: 'Personalizar ambiente', exact: true })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Ambiente', exact: true })
  await expect(dialog).toBeVisible()
  await dialog
    .getByRole('button', { name: 'Parede Sálvia', exact: true })
    .click()
  await dialog
    .getByRole('button', { name: 'Piso Nogueira', exact: true })
    .click()
  await dialog.getByRole('button', { name: 'Concluir', exact: true }).click()
}

test('grouped equipment follows desk fields, keyboard, pointer gestures and rotation in one undo action', async ({
  page,
}) => {
  await page.goto('/editor?scene=gamer')
  await page.getByRole('button', { name: 'Planta 2D', exact: true }).click()
  await selectDesk(page)
  await page
    .getByRole('button', { name: 'Mover com equipamentos', exact: true })
    .click()
  const room = page.getByTestId('editable-room')
  const members = room.locator('[data-attached-to="desk"]')
  await expect(members).toHaveCount(4)
  const originalMonitor = await room
    .locator('[data-object-id="monitor"]')
    .getAttribute('transform')
  const positionX = page.getByRole('spinbutton', {
    name: 'Posição X',
    exact: true,
  })
  await positionX.fill('179')
  await positionX.press('Enter')
  await expect(room.locator('[data-object-id="monitor"]')).toHaveAttribute(
    'transform',
    'translate(239 150) rotate(0 71.5 20)',
  )
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(room.locator('[data-object-id="monitor"]')).toHaveAttribute(
    'transform',
    originalMonitor!,
  )
  const desk = page.getByRole('button', {
    name: 'Selecionar mesa de madeira',
    exact: true,
  })
  await desk.focus()
  await page.keyboard.press('ArrowRight')
  await expect(positionX).toHaveValue('151')
  await expect(room.locator('[data-object-id="monitor"]')).toHaveAttribute(
    'transform',
    'translate(211 150) rotate(0 71.5 20)',
  )
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  // Use the front edge of the desk, clear of the equipment hit areas.
  await room.scrollIntoViewIfNeeded()
  const matrix = await room.evaluate((element) => {
    const m = (element as unknown as SVGSVGElement).getScreenCTM()!
    return { a: m.a, d: m.d, e: m.e, f: m.f }
  })
  const x = 350 * matrix.a + matrix.e
  const y = 237 * matrix.d + matrix.f
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 20 * matrix.a, y + 20 * matrix.d, { steps: 10 })
  await page.mouse.up()
  await expect(positionX).toHaveValue('169')
  await expect
    .poll(async () => {
      const value = await room
        .locator('[data-object-id="monitor"]')
        .getAttribute('transform')
      return value!
        .match(/^translate\(([^ ]+) ([^)]+)\)/)!
        .slice(1)
        .map((number) => Math.round(Number(number) * 1000) / 1000)
    })
    .toEqual([229, 170])
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(positionX).toHaveValue('149')
  await page.getByRole('button', { name: 'Girar 90°', exact: true }).click()
  await expect(
    page.getByRole('spinbutton', { name: 'Rotação (°)', exact: true }),
  ).toHaveValue('90')
  await expect(members).toHaveCount(4)
  for (const member of await members.all())
    expect(await member.getAttribute('transform')).toContain('rotate(90')
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  await page
    .getByRole('button', { name: 'Desvincular equipamentos', exact: true })
    .click()
  await expect(members).toHaveCount(0)
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(members).toHaveCount(4)
  await page.getByRole('button', { name: 'Ver em 3D', exact: true }).click()
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  await expect(page.locator('canvas')).toHaveAttribute(
    'data-selected-id',
    'desk',
  )
})

test('finish samples update both views, preserve modal focus and shortcuts, and participate in history', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/editor?scene=gamer')
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  const canvas = page.getByRole('img', { name: 'Visualização 3D do quarto' })
  const original = await canvas.screenshot()
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await page
    .getByRole('button', { name: 'Personalizar ambiente', exact: true })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Ambiente', exact: true })
  await expect(
    dialog.getByRole('button', { name: 'Fechar ambiente' }),
  ).toBeFocused()
  await page.keyboard.press('Delete')
  await page.keyboard.press('Control+d')
  await page.keyboard.press('ArrowRight')
  await dialog.getByRole('button', { name: 'Parede Sálvia' }).click()
  await dialog.getByRole('button', { name: 'Piso Pedra clara' }).click()
  await expect(
    dialog.getByRole('button', { name: 'Piso Pedra clara' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Personalizar ambiente' }),
  ).toBeFocused()
  await expect(
    page.getByText('Alterações pendentes', { exact: true }),
  ).toBeVisible()
  await expect(canvas).toHaveAttribute('data-object-count', '10')
  await expect(canvas).toHaveAttribute('data-wall', '#889f93')
  await expect(canvas).toHaveAttribute('data-floor', 'stone')
  expect(Buffer.compare(original, await canvas.screenshot())).not.toBe(0)
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(canvas).toHaveAttribute('data-floor', 'smoked')
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(canvas).toHaveAttribute('data-wall', '#34425b')
  await expect(
    page.getByText('Salvo neste navegador', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Refazer', exact: true }).click()
  await page.getByRole('button', { name: 'Refazer', exact: true }).click()
  await page.getByRole('button', { name: 'Planta 2D', exact: true }).click()
  const room = page.getByTestId('editable-room')
  await expect(room).toHaveAttribute('data-wall', '#889f93')
  await expect(room).toHaveAttribute('data-floor', 'stone')
  await page.getByRole('button', { name: 'Personalizar ambiente' }).click()
  await page.getByRole('button', { name: 'Restaurar ambiente' }).click()
  await page.getByRole('button', { name: 'Concluir' }).click()
  await expect(room).toHaveAttribute('data-wall', '#34425b')
  await expect(room).toHaveAttribute('data-floor', 'smoked')
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect(room).toHaveAttribute('data-floor', 'stone')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('save, backup import, library previews and independent shared copies retain finishes and grouping', async ({
  page,
  browser,
}, testInfo) => {
  await page.goto('/editor?scene=gamer')
  await page.getByRole('button', { name: 'Planta 2D', exact: true }).click()
  await selectDesk(page)
  await page
    .getByRole('button', { name: 'Mover com equipamentos', exact: true })
    .click()
  await finishes(page)
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page).toHaveURL(/\/editor\?setup=/)
  await page.reload()
  await page.getByRole('button', { name: 'Planta 2D', exact: true }).click()
  const room = page.getByTestId('editable-room')
  await expect(room).toHaveAttribute('data-floor', 'walnut')
  await expect(room.locator('[data-attached-to="desk"]')).toHaveCount(4)
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click()
  await page.getByRole('button', { name: 'Gerar link', exact: true }).click()
  const url = await page.getByLabel('Link do quarto').inputValue()
  const context = await browser.newContext()
  try {
    const recipient = await context.newPage()
    await recipient.goto(url)
    await expect(
      recipient.getByRole('heading', { name: 'Quarto gamer', exact: true }),
    ).toBeVisible()
    await expect(recipient.locator('canvas')).toHaveAttribute(
      'data-wall',
      '#889f93',
    )
    await expect(recipient.locator('canvas')).toHaveAttribute(
      'data-floor',
      'walnut',
    )
    expect(await recipient.evaluate(() => localStorage.length)).toBe(0)
    await recipient.getByRole('button', { name: 'Editar uma cópia' }).click()
    await expect(recipient).toHaveURL(/\/editor\?setup=/)
    await recipient
      .getByRole('button', { name: 'Planta 2D', exact: true })
      .click()
    await expect(
      recipient
        .getByTestId('editable-room')
        .locator('[data-attached-to="desk"]'),
    ).toHaveCount(4)
    await selectDesk(recipient)
    await recipient.getByRole('spinbutton', { name: 'Posição X' }).fill('179')
    await recipient
      .getByRole('spinbutton', { name: 'Posição X' })
      .press('Enter')
    await expect(
      recipient.locator('[data-object-id="monitor"]'),
    ).toHaveAttribute('transform', 'translate(239 150) rotate(0 71.5 20)')
  } finally {
    await context.close()
  }
  await page.keyboard.press('Escape')
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar JSON', exact: true }).click()
  const download = await pending
  const path = testInfo.outputPath('composition.roomlab.json')
  await download.saveAs(path)
  const data = JSON.parse(await readFile(path, 'utf8'))
  expect(data.version).toBe(1)
  expect(data.setups[0].appearance).toEqual({
    wall: '#889f93',
    floor: 'walnut',
  })
  expect(
    data.setups[0].objects.filter(
      (object: { attachedTo?: string }) => object.attachedTo === 'desk',
    ),
  ).toHaveLength(4)
  await page.getByRole('link', { name: 'Meus setups', exact: true }).click()
  await expect(page.locator('.saved-setup-preview svg')).toHaveAttribute(
    'data-floor',
    'walnut',
  )
  await page.getByLabel('Arquivo do setup').setInputFiles(path)
  await expect(page.locator('.saved-setup')).toHaveCount(2)
  await page
    .getByRole('link', { name: 'Abrir Quarto gamer', exact: true })
    .last()
    .click()
  await page.getByRole('button', { name: 'Planta 2D', exact: true }).click()
  await expect(room).toHaveAttribute('data-wall', '#889f93')
  await expect(room.locator('[data-attached-to="desk"]')).toHaveCount(4)
})
