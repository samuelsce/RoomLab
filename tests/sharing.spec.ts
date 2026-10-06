import { expect, test } from '@playwright/test'
import { encodeSharedDocument } from '../src/features/sharing/codec'
import { createObject } from '../src/features/editor/editorModel'

test('link opens in an independent browser session and edits preserve the shared snapshot', async ({
  page,
  browser,
}) => {
  await page.goto('/editor?scene=empty')
  await page
    .getByRole('button', { name: 'Adicionar mesa', exact: true })
    .click()
  await page.getByLabel('Nome do setup').fill('Quarto compartilhado do Samuel')
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click()
  await page.getByRole('button', { name: 'Gerar link', exact: true }).click()
  const url = await page.getByLabel('Link do quarto').inputValue()
  expect(url).toContain('/setup#data=v1.')
  const recipient = await browser.newContext()
  const viewer = await recipient.newPage()
  await viewer.goto(url)
  await viewer.getByRole('link', { name: 'Pular para o conteúdo' }).focus()
  await viewer.keyboard.press('Enter')
  await expect(viewer.locator('#main-content')).toBeFocused()
  await expect(viewer).toHaveURL(url)
  await expect(
    viewer.getByRole('heading', { name: 'Quarto compartilhado do Samuel' }),
  ).toBeVisible()
  await expect(viewer.getByText('1 objeto nesta composição')).toBeVisible()
  await expect(
    viewer.getByRole('button', { name: /^Selecionar / }),
  ).toHaveCount(0)
  expect(await viewer.evaluate(() => localStorage.length)).toBe(0)
  await page.getByRole('button', { name: 'Fechar compartilhamento' }).click()
  await page.getByLabel('Nome do setup').fill('Nova edição')
  const catalog = page.getByRole('button', { name: 'Catálogo', exact: true })
  if (await catalog.isVisible()) await catalog.click()
  await page
    .getByRole('button', { name: 'Adicionar planta', exact: true })
    .click()
  await viewer.reload()
  await expect(
    viewer.getByRole('heading', { name: 'Quarto compartilhado do Samuel' }),
  ).toBeVisible()
  await expect(viewer.getByText('1 objeto nesta composição')).toBeVisible()
  await viewer.getByRole('button', { name: 'Editar uma cópia' }).click()
  await expect(viewer).toHaveURL(/\/editor\?setup=/)
  await expect(viewer.locator('[data-object-id]')).toHaveCount(1)
  await viewer.getByLabel('Nome do setup').fill('Minha cópia independente')
  await viewer.getByRole('button', { name: 'Salvar', exact: true }).click()
  await viewer.goto(url)
  await expect(
    viewer.getByRole('heading', { name: 'Quarto compartilhado do Samuel' }),
  ).toBeVisible()
  await recipient.close()
})

test('clipboard failure offers manual copying and Escape restores editor focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 })
  await page.goto('/editor')
  await page.getByRole('button', { name: 'Compartilhar', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Fechar compartilhamento' }),
  ).toBeFocused()
  await page.getByRole('button', { name: 'Gerar link', exact: true }).click()
  await expect(page.getByLabel('Link do quarto')).toHaveValue(/v1\./)
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('blocked')
        },
      },
    })
  })
  await page.getByRole('button', { name: 'Copiar link', exact: true }).click()
  await expect(page.getByText(/não permitiu a cópia automática/)).toBeVisible()
  await expect(page.getByLabel('Link do quarto')).toBeFocused()
  expect(
    await page
      .getByLabel('Link do quarto')
      .evaluate((node) => (node as HTMLInputElement).selectionEnd),
  ).toBeGreaterThan(0)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Compartilhar', exact: true }),
  ).toBeFocused()
})

test('incomplete, malformed and unsupported links provide a way to start a room', async ({
  page,
}) => {
  for (const route of [
    '/setup',
    '/setup#data=v1.aaaa',
    '/setup#data=v9.future',
  ]) {
    await page.goto(route)
    await expect(
      page.getByRole('heading', {
        name: 'Não foi possível abrir este quarto.',
      }),
    ).toBeVisible()
    await expect(page.getByRole('alert')).toBeVisible()
  }
  await page
    .getByRole('link', { name: 'Montar meu setup', exact: true })
    .click()
  await expect(page).toHaveURL('/editor?scene=empty')
})

test('unsupported decompression and full local storage keep the original view intact', async ({
  page,
}) => {
  const token = await encodeSharedDocument({
    schemaVersion: 1,
    name: 'Verde',
    scene: 'empty',
    objects: [createObject('plant', 'plant', 0)],
  })
  const url = `/setup#data=${token}`
  await page.goto(url)
  await expect(
    page.getByRole('heading', { name: 'Verde', exact: true }),
  ).toBeVisible()
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Editar uma cópia' }).click()
  await expect(page.getByRole('alert')).toContainText('cheio ou bloqueado')
  await expect(
    page.getByRole('heading', { name: 'Verde', exact: true }),
  ).toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar JSON', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('verde.roomlab.json')
  await page.addInitScript(() => {
    Object.defineProperty(window, 'DecompressionStream', { value: undefined })
  })
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('navegador atualizado')
})
