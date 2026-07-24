import { expect, test } from '@playwright/test'

// Every one of these was broken by the shadow boundary in v2, and is the reason v3 drops it.

test.beforeEach(async ({ page }) => {
  await page.goto('index.html')
  await expect(page.getByTestId('proof').locator('.card')).toBeVisible()
})

test('$refs resolves from inside a component', async ({ page }) => {
  await expect(page.getByTestId('proof').locator('strong').first()).toHaveText('from-host')
})

test('$root resolves from inside a component', async ({ page }) => {
  await expect(page.getByTestId('proof').locator('strong').last()).toHaveText('DIV')
})

test('document stylesheets apply without any opt-in', async ({ page }) => {
  await expect(page.getByTestId('styled').locator('.styled')).toHaveCSS('color', 'rgb(0, 128, 0)')
})

test('document.querySelector finds component content', async ({ page }) => {
  const found = await page.evaluate(() => Boolean(document.querySelector('#proof-input')))

  expect(found).toBe(true)
})

test('form controls submit with an ancestor form', async ({ page }) => {
  await page.getByTestId('submit').click()

  await expect(page.getByTestId('form-result')).toHaveText('field=submitted')
})

test('a label outside the component can target an input inside it', async ({ page }) => {
  await page.getByText('A label outside the component').click()

  await expect(page.locator('#proof-input')).toBeFocused()
})
