import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

const browser = await chromium.launch()
const directory = 'docs/screenshots'
await mkdir(directory, { recursive: true })
try {
  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 })
    for (const [route, filename] of [
      ['/', 'home'],
      ['/editor', 'editor'],
    ]) {
      await page.goto(`http://127.0.0.1:5173${route}`)
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({
        path: `${directory}/${filename}-${name}.png`,
        fullPage: true,
      })
    }
    await page.close()
  }
} finally {
  await browser.close()
}
