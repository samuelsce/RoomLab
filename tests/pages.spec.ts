import { expect, test } from '@playwright/test'

test('same-page links preserve Pages routes, focus their targets and keep an unsaved editor intact', async ({
  page,
}) => {
  await page.goto('./')
  const homeUrl = page.url()
  const environments = page.getByRole('link', {
    name: 'Os ambientes',
    exact: true,
  })
  if (await environments.isVisible()) {
    await environments.click()
    await expect(page.locator('#examples')).toBeFocused()
    await expect(page).toHaveURL(homeUrl)
    await page.evaluate(() => window.scrollTo(0, 0))
    await environments.click()
    await expect(page.locator('#examples')).toBeFocused()
  }
  await page.getByRole('link', { name: 'Pular para o conteúdo' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await expect(page).toHaveURL(homeUrl)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Seu quarto.Seu universo.',
  )
  await page.goto('./#/editor?scene=empty')
  await page
    .getByRole('button', { name: 'Adicionar mesa', exact: true })
    .click()
  await page.getByLabel('Nome do setup').fill('Rascunho intacto')
  const editorUrl = page.url()
  await page.getByRole('link', { name: 'Pular para o conteúdo' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()
  await expect(page).toHaveURL(editorUrl)
  await expect(page.getByLabel('Nome do setup')).toHaveValue('Rascunho intacto')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByText('1 objeto', { exact: true })).toBeVisible()
})

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
  await expect(page).toHaveURL(/\/RoomLab\/#\/editor\?scene=gamer$/)
  await expect(page.locator('.room-preview')).toHaveAttribute(
    'data-ready',
    'true',
  )
  const canvas = page.getByRole('img', { name: 'Visualização 3D do quarto' })
  const box = (await canvas.boundingBox())!
  await canvas.click({ position: { x: box.width * 0.62, y: box.height * 0.5 } })
  await expect(
    page.getByRole('heading', { name: 'Cama', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Cor Verde', exact: true }).click()
  await page
    .getByRole('button', {
      name: 'Editar mesa de madeira na lista',
      exact: true,
    })
    .click()
  await page
    .getByRole('button', { name: 'Mover com equipamentos', exact: true })
    .click()
  await page
    .getByRole('button', { name: 'Personalizar ambiente', exact: true })
    .click()
  await page.getByRole('button', { name: 'Parede Sálvia', exact: true }).click()
  await page.getByRole('button', { name: 'Piso Nogueira', exact: true }).click()
  await page.getByRole('button', { name: 'Concluir', exact: true }).click()
  await page.getByLabel('Nome do setup').fill('Setup no GitHub Pages')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page).toHaveURL(/\/RoomLab\/#\/editor\?setup=/)
  await page.reload()
  await expect(canvas).toHaveAttribute('data-scene', 'gamer')
  await expect(canvas).toHaveAttribute('data-wall', '#889f93')
  await expect(canvas).toHaveAttribute('data-floor', 'walnut')
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
  await expect(recipient.locator('.room-selection')).toHaveCount(0)
  await recipient.reload()
  await expect(
    recipient.getByRole('heading', { name: 'Setup no GitHub Pages' }),
  ).toBeVisible()
  expect(
    requests.every((url) => !url.includes('data=') && !url.includes('/api/')),
  ).toBe(true)
  await recipient.getByRole('button', { name: 'Editar uma cópia' }).click()
  await expect(recipient).toHaveURL(/\/RoomLab\/#\/editor\?setup=/)
  await expect(recipient.getByLabel('Nome do setup')).toHaveValue(
    'Setup no GitHub Pages',
  )
  await recipient
    .getByRole('button', { name: 'Planta 2D', exact: true })
    .click()
  await expect(recipient.locator('[data-object-id]')).toHaveCount(10)
  await expect(recipient.getByTestId('editable-room')).toHaveAttribute(
    'data-floor',
    'walnut',
  )
  await expect(
    recipient.getByTestId('editable-room').locator('[data-attached-to="desk"]'),
  ).toHaveCount(4)
  await expect(
    recipient.locator('[data-object-id="bed"] rect[fill="#48705a"]').first(),
  ).toBeVisible()
  await expect(
    recipient.getByText('Salvo neste navegador', { exact: true }),
  ).toBeVisible()
  expect(failures).toEqual([])
  await context.close()
})
