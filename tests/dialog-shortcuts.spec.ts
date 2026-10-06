import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const composition = (page: Page) =>
  page
    .locator('[data-testid="editable-room"] [data-object-id]')
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        id: node.getAttribute('data-object-id'),
        transform: node.getAttribute('transform'),
      })),
    )

test('sharing isolates the room from deletion, movement, duplication, history and save shortcuts', async ({
  page,
}) => {
  await page.goto('/editor')
  const desk = page.getByRole('button', {
    name: 'Selecionar mesa de madeira',
    exact: true,
  })
  await desk.focus()
  await page.keyboard.press('ArrowRight')
  const before = await composition(page)
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click()
  for (const key of [
    'Delete',
    'Control+d',
    'ArrowRight',
    'Control+z',
    'Control+y',
    'Control+s',
  ]) {
    await page.keyboard.press(key)
    await expect.poll(() => composition(page)).toEqual(before)
    await expect(page.getByRole('dialog')).toBeVisible()
  }
  expect(
    await page.evaluate(() => localStorage.getItem('roomlab.setups.v1')),
  ).toBeNull()
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('button', { name: 'Compartilhar', exact: true }),
  ).toBeFocused()
  await desk.focus()
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => composition(page)).not.toEqual(before)
})

test('leaving confirmation keeps the room and undo history unchanged while open', async ({
  page,
}) => {
  await page.goto('/editor')
  const original = await composition(page)
  await page
    .getByRole('button', { name: 'Selecionar mesa de madeira', exact: true })
    .focus()
  await page.keyboard.press('ArrowRight')
  const edited = await composition(page)
  await page.getByRole('link', { name: 'Meus setups', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  for (const key of ['Backspace', 'Control+d', 'ArrowLeft', 'Control+z']) {
    await page.keyboard.press(key)
    await expect.poll(() => composition(page)).toEqual(edited)
  }
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
  await expect.poll(() => composition(page)).toEqual(original)
})
