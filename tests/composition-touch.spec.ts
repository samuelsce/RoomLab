import { expect, test } from '@playwright/test'

test('a real touch drag moves the desk and its linked equipment without scrolling or splitting history', async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Real touch profile only')
  await page.goto('/editor?scene=gamer')
  await page.getByRole('button', { name: 'Planta 2D', exact: true }).click()
  await page.getByRole('button', { name: 'Propriedades', exact: true }).click()
  await page
    .getByRole('button', { name: 'Mover com equipamentos', exact: true })
    .click()
  const room = page.getByTestId('editable-room')
  await room.scrollIntoViewIfNeeded()
  await page.evaluate(() => document.fonts.ready)
  const matrix = await room.evaluate((element) => {
    const m = (element as unknown as SVGSVGElement).getScreenCTM()!
    return { a: m.a, d: m.d, e: m.e, f: m.f }
  })
  const x = 350 * matrix.a + matrix.e
  const y = 237 * matrix.d + matrix.f
  const scrollBefore = await page.evaluate(() => scrollY)
  const session = await context.newCDPSession(page)
  try {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y, id: 1 }],
    })
    for (let step = 1; step <= 8; step++)
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          { x: x + step * 3 * matrix.a, y: y + step * 2 * matrix.d, id: 1 },
        ],
      })
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    })
    await expect
      .poll(async () => {
        const value = await room
          .locator('[data-object-id="monitor"]')
          .getAttribute('transform')
        return value!
          .match(/^translate\(([^ ]+) ([^)]+)\)/)!
          .slice(1)
          .map((number) => Math.round(Number(number) * 1000) / 1000)
      })
      .toEqual([233, 166])
    await expect(room.locator('[data-attached-to="desk"]')).toHaveCount(4)
    expect(
      Math.abs((await page.evaluate(() => scrollY)) - scrollBefore),
    ).toBeLessThan(2)
    await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
    await expect(room.locator('[data-object-id="monitor"]')).toHaveAttribute(
      'transform',
      'translate(209 150) rotate(0 71.5 20)',
    )
    await page.getByRole('button', { name: 'Desfazer', exact: true }).click()
    await expect(room.locator('[data-attached-to="desk"]')).toHaveCount(0)
  } finally {
    await session.detach()
  }
})
