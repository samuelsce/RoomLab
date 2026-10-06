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
    if (name === 'desktop') {
      await page
        .getByRole('button', {
          name: 'Editar cadeira de escritório na lista',
          exact: true,
        })
        .click()
      const rotation = page.getByRole('spinbutton', { name: 'Rotação (°)' })
      await rotation.fill('180')
      await rotation.press('Enter')
      await page
        .getByRole('button', { name: 'Luz noturna', exact: true })
        .click()
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      )
      await page
        .getByRole('img', { name: 'Visualização 3D do quarto' })
        .screenshot({
          path: 'docs/screenshots/chair-front-desktop.png',
          animations: 'disabled',
        })
    }
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
