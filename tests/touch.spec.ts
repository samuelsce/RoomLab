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
