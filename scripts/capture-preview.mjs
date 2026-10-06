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
    await page.goto('http://127.0.0.1:5173/setups')
    await page.screenshot({
      path: `${directory}/setups-empty-${name}.png`,
      fullPage: true,
    })
    await page.goto('http://127.0.0.1:5173/editor?scene=plants')
    await page.getByLabel('Nome do setup').fill('Meu cantinho com plantas')
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await page.getByRole('link', { name: 'Meus setups', exact: true }).click()
    await page.screenshot({
      path: `${directory}/setups-${name}.png`,
      fullPage: true,
    })
    await page
      .getByRole('link', {
        name: 'Abrir Meu cantinho com plantas',
        exact: true,
      })
      .click()
    await page
      .getByRole('button', { name: 'Compartilhar', exact: true })
      .click()
    await page.getByRole('button', { name: 'Gerar link', exact: true }).click()
    const sharedUrl = await page.getByLabel('Link do quarto').inputValue()
    await page.screenshot({
      path: `${directory}/sharing-${name}.png`,
      fullPage: true,
    })
    await page.goto(sharedUrl)
    await page
      .getByRole('heading', { name: 'Meu cantinho com plantas', exact: true })
      .waitFor()
    await page.screenshot({
      path: `${directory}/shared-${name}.png`,
      fullPage: true,
    })
    await page.close()
  }
} finally {
  await browser.close()
}
