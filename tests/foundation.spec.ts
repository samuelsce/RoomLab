import { expect, test } from '@playwright/test'

test('home leads to the editor and catalog details without runtime errors', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Seu quarto.Seu universo.',
  )
  await page.evaluate(() => document.fonts.ready)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: testInfo.outputPath('home.png'),
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Luz natural', exact: true }).click()
  await page.getByRole('link', { name: 'Montar meu setup' }).click()
  await expect(page).toHaveURL(/\/editor\?scene=study$/)
  await expect(page.getByText('Não salvo', { exact: true })).toBeVisible()
  await page
    .getByRole('searchbox', { name: 'Buscar objetos' })
    .fill('luminaria')
  await expect(
    page.getByRole('button', { name: 'Adicionar luminária' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Adicionar monitor', exact: true }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Adicionar luminária' }).click()
  await expect(
    page.getByRole('heading', { name: 'Luminária', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('11 objetos', { exact: true })).toBeVisible()
  await page
    .getByRole('button', { name: 'Selecionar monitor', exact: true })
    .focus()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('heading', { name: 'Monitor', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Objeto no quarto', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Aumentar zoom' }).click()
  await expect(page.getByLabel('Zoom', { exact: true })).toHaveText('110%')
  await page.getByRole('button', { name: 'Ajustar quarto à tela' }).click()
  await expect(page.getByLabel('Zoom', { exact: true })).toHaveText('100%')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.screenshot({
    path: testInfo.outputPath('editor.png'),
    fullPage: true,
  })
  expect(errors).toEqual([])
})

test('empty room and example selection survive direct navigation and reload', async ({
  page,
}) => {
  await page.goto('/editor?scene=empty')
  await expect(
    page.getByRole('heading', { name: 'Espaço para suas ideias.' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Adicionar mesa', exact: true })
    .click()
  await expect(page.getByText('1 objeto', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Selecionar mesa de madeira' }),
  ).toBeVisible()
  await page.goto('/editor?scene=dual')
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Selecionar dois monitores' }),
  ).toBeVisible()
  await page.goto('/editor?scene=plants')
  await expect(
    page.getByRole('button', { name: 'Selecionar planta', exact: true }),
  ).toHaveCount(2)
  await page
    .getByRole('button', { name: 'Selecionar tapete', exact: true })
    .focus()
  await page.keyboard.press('Enter')
  await expect(
    page.locator('[data-object-id="rug"] rect[fill="#99ae95"]').first(),
  ).toBeVisible()
})

test('filters can recover from an empty result and unknown routes show a way back', async ({
  page,
}) => {
  await page.goto('/editor')
  await page.getByRole('button', { name: 'Tecnologia', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Adicionar ' })).toHaveCount(4)
  await page
    .getByRole('searchbox', { name: 'Buscar objetos' })
    .fill('inexistente')
  await expect(page.getByText('Nenhum objeto encontrado.')).toBeVisible()
  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(page.getByRole('button', { name: 'Adicionar ' })).toHaveCount(13)
  await page.goto('/nao-existe')
  await page.getByRole('link', { name: 'Voltar ao início' }).click()
  await expect(page).toHaveURL('/')
})

test('narrow screen and reduced motion retain usable layout and keyboard entry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Pular para o conteúdo' }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
  await page.goto('/editor')
  await page.getByRole('button', { name: 'Adicionar planta' }).click()
  await expect(
    page.getByRole('heading', { name: 'Planta', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Catálogo', exact: true }).click()
  await expect(
    page.getByRole('searchbox', { name: 'Buscar objetos' }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})
