import { expect, test } from '@playwright/test'

// Every one of these was broken by the shadow boundary in v2, and is the reason v3 drops it.

test.beforeEach(async ({ page }) => {
  await page.goto('index.html')
  await expect(page.getByTestId('proof-card-host').locator('.card')).toBeVisible()
})

test('$refs resolves from inside a component', async ({ page }) => {
  await expect(page.getByTestId('proof-card-host').locator('strong').first()).toHaveText(
    'from-host',
  )
})

test('$root resolves from inside a component', async ({ page }) => {
  await expect(page.getByTestId('proof-card-host').locator('strong').last()).toHaveText('DIV')
})

// This is issue #41 in test form. The page is styled with a compiled Tailwind build, and these
// utilities are used only inside component templates. Under the shadow root they could not
// reach that content at all without naming a stylesheet and adopting it.
test('Tailwind utilities apply to component content without any opt-in', async ({ page }) => {
  const styledCard = page.getByTestId('styled-card-host').locator('.styled')

  await expect(styledCard).toHaveCSS('padding', '16px')
  // Matched loosely on the hue: WebKit serializes it as 247.858002 where the others say
  // 247.858. What matters is that the utility reached the content at all.
  await expect(styledCard).toHaveCSS('background-color', /^oklch\(0\.984 0\.003 247\.858/)
  await expect(styledCard).toHaveCSS('color', 'rgb(0, 128, 0)')
})

test('document.querySelector finds component content', async ({ page }) => {
  const found = await page.evaluate(() => Boolean(document.querySelector('#proof-input')))

  expect(found).toBe(true)
})

test('form controls submit with an ancestor form', async ({ page }) => {
  await page.getByTestId('submit-form-button').click()

  await expect(page.getByTestId('form-result-log')).toHaveText('field=submitted')
})

// Scoped to the form because the same label text also appears in the section's Usage snippet.
test('a label outside the component can target an input inside it', async ({ page }) => {
  await page.getByTestId('boundary-form').getByText('A label outside the component').click()

  await expect(page.locator('#proof-input')).toBeFocused()
})
