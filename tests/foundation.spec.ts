import { expect, test } from '@playwright/test'

test('home leads to the editor and catalog details without runtime errors', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Monte um quartoque combinacom seu setup.',
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
  await page.getByRole('link', { name: 'Montar meu setup' }).click()
  await expect(page).toHaveURL(/\/editor$/)
  await expect(page.getByText('Demonstração', { exact: true })).toBeVisible()
  await page
    .getByRole('searchbox', { name: 'Buscar objetos' })
    .fill('luminaria')
  await expect(
    page.getByRole('button', { name: 'Ver detalhes: Luminária' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Ver detalhes: Monitor', exact: true }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Ver detalhes: Luminária' }).click()
  await expect(
    page.getByRole('heading', { name: 'Luminária', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('Prévia do catálogo', { exact: true }),
  ).toBeVisible()
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
  await page.getByRole('button', { name: 'Restaurar zoom' }).click()
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
  await page.getByRole('link', { name: 'Usar quarto de exemplo' }).click()
  await expect(page).toHaveURL(/scene=study/)
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
  await expect(page.getByText('Verde suave', { exact: true })).toBeVisible()
})

test('filters can recover from an empty result and unknown routes show a way back', async ({
  page,
}) => {
  await page.goto('/editor')
  await page.getByRole('button', { name: 'Tecnologia', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Ver detalhes:' })).toHaveCount(
    4,
  )
  await page
    .getByRole('searchbox', { name: 'Buscar objetos' })
    .fill('inexistente')
  await expect(page.getByText('Nenhum objeto encontrado.')).toBeVisible()
  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(page.getByRole('button', { name: 'Ver detalhes:' })).toHaveCount(
    12,
  )
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
  await page.getByRole('button', { name: 'Ver detalhes: Planta' }).click()
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
