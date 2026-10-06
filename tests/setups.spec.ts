import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { STORAGE_KEY } from '../src/features/setups/storage'

test('empty names, blocked reads and long names at 320 pixels are handled', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 })
  await page.goto('/editor?scene=empty')
  await page.getByLabel('Nome do setup').fill('   ')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Dê um nome')
  await page.getByLabel('Nome do setup').fill('a'.repeat(60))
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.getByRole('link', { name: 'Meus setups', exact: true }).click()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('blocked', 'SecurityError')
      },
    })
  })
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('bloqueou')
  await page.goto('/editor?setup=missing')
  await expect(page.getByText(/bloqueou o armazenamento/)).toBeVisible()
})

test('save reload rename copy delete and reopen preserve the room', async ({
  page,
}) => {
  await page.goto('/editor?scene=empty')
  await page
    .getByRole('button', { name: 'Adicionar mesa', exact: true })
    .click()
  await page.getByLabel('Nome do setup').fill('Quarto do Samuel')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page).toHaveURL(/setup=/)
  await expect(
    page.getByText('Salvo neste navegador', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Desfazer', exact: true }),
  ).toBeEnabled()
  await page.reload()
  await expect(page.getByLabel('Nome do setup')).toHaveValue('Quarto do Samuel')
  await expect(page.locator('[data-object-id]')).toHaveCount(1)
  await page.getByLabel('Nome do setup').fill('Meu escritório')
  await expect(
    page.getByText('Alterações pendentes', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await page.getByRole('link', { name: 'Meus setups', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Meu escritório', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'Duplicar Meu escritório', exact: true })
    .click()
  await expect(page.locator('.saved-setup')).toHaveCount(2)
  await page
    .getByRole('button', { name: 'Excluir Meu escritório', exact: true })
    .click()
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await expect(page.locator('.saved-setup')).toHaveCount(2)
  await page
    .getByRole('button', { name: 'Excluir Meu escritório', exact: true })
    .click()
  await page.getByRole('button', { name: 'Excluir setup', exact: true }).click()
  await page
    .getByRole('link', { name: 'Abrir Meu escritório (cópia)', exact: true })
    .click()
  await expect(page.locator('[data-object-id]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Salvar cópia', exact: true }).click()
  await page.getByRole('link', { name: 'Meus setups', exact: true }).click()
  await expect(page.locator('.saved-setup')).toHaveCount(2)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('unsaved navigation can be cancelled and browser back is guarded', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Montar meu setup' }).click()
  await page.getByLabel('Nome do setup').fill('Ainda editando')
  await page.getByRole('link', { name: 'RoomLab, página inicial' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Cancelar', exact: true }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goBack()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page
    .getByRole('button', { name: 'Sair sem salvar', exact: true })
    .click()
  await expect(page).toHaveURL('/')
})

test('JSON backup imports a new copy; PNG contains an actual rendered image', async ({
  page,
}, testInfo) => {
  await page.goto('/editor?scene=plants')
  await page.getByLabel('Nome do setup').fill('Backup verde')
  const jsonDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar JSON' }).click()
  const json = await jsonDownload
  const path = testInfo.outputPath(json.suggestedFilename())
  await json.saveAs(path)
  const data = JSON.parse(await readFile(path, 'utf8'))
  expect(data.version).toBe(1)
  expect(data.setups[0].objects.length).toBeGreaterThan(0)
  expect(data.setups[0]).not.toHaveProperty('selectedId')
  const pngDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Baixar PNG' }).click()
  const png = await pngDownload
  const pngPath = testInfo.outputPath(png.suggestedFilename())
  await png.saveAs(pngPath)
  const bytes = await readFile(pngPath)
  expect(bytes.subarray(1, 4).toString()).toBe('PNG')
  expect(bytes.readUInt32BE(16)).toBe(1520)
  expect(bytes.readUInt32BE(20)).toBe(1220)
  expect(bytes.length).toBeGreaterThan(10_000)
  await page.getByRole('link', { name: 'Meus setups', exact: true }).click()
  await page
    .getByRole('button', { name: 'Sair sem salvar', exact: true })
    .click()
  await page.getByLabel('Arquivo do setup').setInputFiles(path)
  await expect(page.locator('.saved-setup')).toHaveCount(1)
  await page.getByLabel('Arquivo do setup').setInputFiles(path)
  await expect(page.locator('.saved-setup')).toHaveCount(2)
  await page.getByRole('link', { name: 'Abrir Backup verde' }).first().click()
  await expect(page.locator('[data-object-id]')).toHaveCount(
    data.setups[0].objects.length,
  )
})

test('invalid storage stays intact and write failures retain editable state', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(
    (key) => localStorage.setItem(key, '{broken'),
    STORAGE_KEY,
  )
  await page.goto('/setups')
  await expect(page.getByRole('alert')).toContainText('preservados')
  await page.goto('/editor?scene=empty')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('preservados')
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe('{broken')
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY)
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError')
    }
  })
  await page
    .getByRole('button', { name: 'Adicionar mesa', exact: true })
    .click()
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('cheio ou bloqueado')
  await expect(page.locator('[data-object-id]')).toHaveCount(1)
  await expect(page.getByText('Não salvo', { exact: true })).toBeVisible()
})

test('stale editor cannot overwrite a newer revision and can save a copy', async ({
  page,
  context,
}) => {
  await page.goto('/editor?scene=empty')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  const second = await context.newPage()
  await second.goto(page.url())
  await second.getByLabel('Nome do setup').fill('Versão de outra aba')
  await second.getByRole('button', { name: 'Salvar', exact: true }).click()
  await page.getByLabel('Nome do setup').fill('Minha versão')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('outra aba')
  await page.getByRole('button', { name: 'Salvar cópia', exact: true }).click()
  await page.getByRole('link', { name: 'Meus setups', exact: true }).click()
  await expect(page.locator('.saved-setup')).toHaveCount(2)
  await expect(
    page.getByRole('heading', { name: 'Versão de outra aba' }),
  ).toBeVisible()
})

test('invalid imports and unknown local links have recoverable error states', async ({
  page,
}) => {
  await page.goto('/setups')
  await expect(
    page.getByRole('heading', { name: 'Seu primeiro quarto começa aqui.' }),
  ).toBeVisible()
  await page.getByLabel('Arquivo do setup').setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{broken'),
  })
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.locator('.saved-setup')).toHaveCount(0)
  await page.getByRole('button', { name: 'Atualizar lista' }).click()
  await expect(
    page.getByRole('heading', { name: 'Seu primeiro quarto começa aqui.' }),
  ).toBeVisible()
  await page.goto('/editor?setup=missing')
  await expect(
    page.getByRole('heading', { name: 'Não foi possível abrir o setup.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Ver meus setups' }).click()
  await expect(page).toHaveURL('/setups')
})
