import { expect, test } from '@playwright/test'

test('built Pages app reloads hash routes and opens a share without a server or local data', async ({
  page,
  browser,
}) => {
  const failures: string[] = []
  page.on('pageerror', (error) => failures.push(error.message))
  await page.goto('./')
  await page
    .getByRole('link', { name: 'Montar meu setup', exact: true })
    .click()
  await expect(page).toHaveURL(/\/RoomLab\/#\/editor$/)
  await page.getByLabel('Nome do setup').fill('Setup no GitHub Pages')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await page.reload()
  await expect(page.getByLabel('Nome do setup')).toHaveValue(
    'Setup no GitHub Pages',
  )
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click()
  await page.getByRole('button', { name: 'Gerar link', exact: true }).click()
  await expect(page.getByLabel('Link do quarto')).toHaveValue(
    /\/RoomLab\/#\/setup\?data=v1\./,
  )
  const url = await page.getByLabel('Link do quarto').inputValue()
  expect(new URL(url).pathname).toBe('/RoomLab/')
  const context = await browser.newContext()
  const recipient = await context.newPage()
  const requests: string[] = []
  recipient.on('request', (request) => requests.push(request.url()))
  const response = await recipient.goto(url)
  expect(response?.status()).toBe(200)
  await expect(
    recipient.getByRole('heading', { name: 'Setup no GitHub Pages' }),
  ).toBeVisible()
  expect(await recipient.evaluate(() => localStorage.length)).toBe(0)
  await recipient.reload()
  await expect(
    recipient.getByRole('heading', { name: 'Setup no GitHub Pages' }),
  ).toBeVisible()
  expect(
    requests.every((url) => !url.includes('data=') && !url.includes('/api/')),
  ).toBe(true)
  await recipient.getByRole('button', { name: 'Editar uma cópia' }).click()
  await expect(recipient).toHaveURL(/\/RoomLab\/#\/editor\?setup=/)
  await expect(recipient.locator('[data-object-id]')).toHaveCount(10)
  await expect(
    recipient.getByText('Salvo neste navegador', { exact: true }),
  ).toBeVisible()
  expect(failures).toEqual([])
  await context.close()
})
