import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const base = process.env.ROOMLAB_PREVIEW_URL ?? 'http://127.0.0.1:5174'
const browser = await chromium.launch()
await mkdir('docs/screenshots', { recursive: true })
try {
  for (const [profile, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['tablet', { width: 768, height: 1024 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`${base}/editor?scene=gamer`)
    await page.evaluate(() => document.fonts.ready)
    await page.locator('.room-preview[data-ready="true"]').waitFor()
    await page.getByRole('button', { name: 'Personalizar ambiente' }).click()
    const dialog = page.getByRole('dialog', { name: 'Ambiente', exact: true })
    await dialog.getByRole('button', { name: 'Parede Sálvia' }).click()
    await dialog.getByRole('button', { name: 'Piso Nogueira' }).click()
    await dialog.locator('.environment-options').evaluate((element) => {
      element.scrollTop = 0
    })
    await page.screenshot({ path: `docs/screenshots/materials-${profile}.png` })
    await dialog.getByRole('button', { name: 'Concluir' }).click()
    await page.getByRole('button', { name: 'Luz noturna', exact: true }).click()
    const properties = page.getByRole('button', {
      name: 'Propriedades',
      exact: true,
    })
    if (await properties.isVisible()) await properties.click()
    await page
      .getByRole('button', {
        name: 'Editar mesa de madeira na lista',
        exact: true,
      })
      .click()
    await page.getByRole('button', { name: 'Mover com equipamentos' }).click()
    await page
      .locator('.scene-panel')
      .evaluate((element) => element.scrollIntoView({ block: 'start' }))
    await page.screenshot({
      path: `docs/screenshots/composition-${profile}.png`,
    })
    console.log(`${profile}: materiais e agrupamento capturados`)
    await page.close()
  }
} finally {
  await browser.close()
}
