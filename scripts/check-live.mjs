import { chromium, expect } from '@playwright/test'

const url =
  process.env.ROOMLAB_DEMO_URL || 'https://samuelsce.github.io/RoomLab/'
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const response = await page.goto(url)
  expect(response?.status()).toBe(200)
  await page
    .getByRole('link', { name: 'Montar meu setup', exact: true })
    .click()
  await page.getByRole('button', { name: 'Ver em 3D', exact: true }).click()
  await page.locator('.room-preview[data-ready="true"]').waitFor()
  await expect(
    page.getByRole('img', { name: 'Visualização 3D do quarto' }),
  ).toHaveAttribute('data-scene', 'gamer')
  await page.getByLabel('Nome do setup').fill('Quarto para testar o link')
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click()
  await page.getByRole('button', { name: 'Gerar link', exact: true }).click()
  const link = await page.getByLabel('Link do quarto').inputValue()
  expect(new URL(link).origin).toBe(new URL(url).origin)
  const recipient = await browser.newPage()
  const sharedResponse = await recipient.goto(link)
  expect(sharedResponse?.status()).toBe(200)
  await expect(
    recipient.getByRole('heading', {
      name: 'Quarto para testar o link',
      exact: true,
    }),
  ).toBeVisible()
  await recipient.locator('.room-preview[data-ready="true"]').waitFor()
  expect(await recipient.evaluate(() => localStorage.length)).toBe(0)
  await recipient
    .getByRole('button', { name: 'Editar uma cópia', exact: true })
    .click()
  await recipient
    .getByRole('button', { name: 'Planta 2D', exact: true })
    .click()
  await expect(recipient.locator('[data-object-id]')).toHaveCount(10)
  await recipient.reload()
  await expect(recipient.getByLabel('Nome do setup')).toHaveValue(
    'Quarto para testar o link',
  )
  expect(errors).toEqual([])
  console.log(
    'Live check passed: HTTP 200, independent shared view, editable copy and reload.',
  )
} finally {
  await browser.close()
}
