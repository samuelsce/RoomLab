import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const base = process.env.ROOMLAB_PREVIEW_URL || 'http://127.0.0.1:5174'
await mkdir('docs/screenshots', { recursive: true })
const browser = await chromium.launch()
try {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(base)
    await page.locator('.room-preview[data-ready="true"]').waitFor()
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({
      path: `docs/screenshots/studio-${name}.png`,
      fullPage: true,
      animations: 'disabled',
    })
    await page.getByRole('button', { name: 'Luz natural', exact: true }).click()
    await page.screenshot({
      path: `docs/screenshots/natural-${name}.png`,
      fullPage: true,
      animations: 'disabled',
    })
    await page.goto(`${base}/editor?scene=gamer`)
    await page.getByRole('button', { name: 'Ver em 3D', exact: true }).click()
    await page.locator('.room-preview[data-ready="true"]').waitFor()
    await page.screenshot({
      path: `docs/screenshots/gamer-editor-${name}.png`,
      fullPage: true,
      animations: 'disabled',
    })
    console.log(
      JSON.stringify({
        name,
        errors,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      }),
    )
    await page.close()
  }
} finally {
  await browser.close()
}
