import { test, expect } from '@playwright/test'

test('mobile panels and catalog respond to taps from initial load', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Touch profile only')
  await page.goto('/editor')
  await page.getByRole('button', { name: 'Propriedades', exact: true }).tap()
  await expect(
    page.getByRole('button', { name: 'Propriedades', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Catálogo', exact: true }).tap()
  await expect(
    page.getByRole('button', { name: 'Catálogo', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true')
  await page
    .getByRole('button', { name: 'Adicionar planta', exact: true })
    .tap()
  await expect(page.getByText('11 objetos', { exact: true })).toBeVisible()
})

test('compact properties keep both room views visible while adding and editing a piece', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'Compact editor only')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/editor?scene=empty')
  await page
    .getByRole('button', { name: 'Adicionar monitor', exact: true })
    .click()
  await expect(page.locator('.editor-page')).toHaveClass(/properties-docked/)
  await expect(
    page.getByRole('heading', { name: 'Propriedades', exact: true }),
  ).toBeFocused()
  const room = page.getByTestId('editable-room')
  const roomIsVisibleAbovePanel = () =>
    room.evaluate((node) => {
      const rect = node.getBoundingClientRect()
      const panel = document
        .querySelector('.mobile-panel-switch')!
        .getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= panel.top && rect.width > 0
    })
  await expect.poll(roomIsVisibleAbovePanel).toBe(true)
  const width = page.getByRole('spinbutton', { name: 'Largura', exact: true })
  await width.fill('120')
  await width.press('Enter')
  await page.getByRole('button', { name: 'Cor Verde', exact: true }).click()
  await expect(room.locator('rect[fill="#48705a"]').first()).toBeVisible()
  await expect.poll(roomIsVisibleAbovePanel).toBe(true)
  await page.getByRole('button', { name: 'Catálogo', exact: true }).click()
  await page
    .getByRole('button', { name: 'Adicionar planta', exact: true })
    .click()
  await expect(page.getByText('2 objetos', { exact: true })).toBeVisible()
  await expect.poll(roomIsVisibleAbovePanel).toBe(true)
  await page.screenshot({
    path: testInfo.outputPath('compact-properties.png'),
    fullPage: false,
  })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.goto('/editor?scene=gamer')
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  await page
    .getByRole('button', { name: 'Adicionar planta', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Propriedades', exact: true }),
  ).toBeFocused()
  await expect
    .poll(() =>
      page.locator('.room-preview').evaluate((node) => {
        const rect = node.getBoundingClientRect()
        const panel = document
          .querySelector('.mobile-panel-switch')!
          .getBoundingClientRect()
        return rect.top >= 0 && rect.bottom <= panel.top && rect.width > 0
      }),
    )
    .toBe(true)
  await page.getByRole('button', { name: 'Girar vista para a direita' }).click()
  await expect(page.getByText('11 objetos', { exact: true })).toBeVisible()
})
