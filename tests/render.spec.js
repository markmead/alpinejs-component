import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('index.html')
  await expect(page.getByTestId('basic').locator('.card')).toBeVisible()
})

test('renders an on-page template into the host', async ({ page }) => {
  await expect(page.getByTestId('basic').locator('h3')).toHaveText('John')
})

test('renders into the light DOM rather than a shadow root', async ({ page }) => {
  const hasShadowRoot = await page.getByTestId('basic').evaluate((host) => Boolean(host.shadowRoot))

  expect(hasShadowRoot).toBe(false)
})

test('component content evaluates against the host scope', async ({ page }) => {
  await expect(page.getByTestId('basic').locator('li')).toHaveText(['JavaScript', 'CSS'])
})

test('re-renders when the expression changes', async ({ page }) => {
  await expect(page.getByTestId('dynamic').locator('.card')).toContainText('View A')

  await page.getByTestId('view-b').click()

  await expect(page.getByTestId('dynamic').locator('.card')).toContainText('View B')
  await expect(page.getByTestId('dynamic').locator('> *')).toHaveCount(1)
})

test('unmounts when the expression resolves to empty', async ({ page }) => {
  await page.getByTestId('view-clear').click()

  await expect(page.getByTestId('dynamic')).toBeEmpty()
})

test('renders nothing for a missing template', async ({ page }) => {
  await expect(page.getByTestId('missing')).toBeEmpty()
})

test('initializes mounted content exactly once', async ({ page }) => {
  // Alpine's mutation observer also sees light DOM writes, so a missing mutateDom wrapper
  // would initialize every node twice.
  await expect(page.getByTestId('counts')).toHaveText('inits: 1, effects: 1')
})

test('keeps mounted content reactive', async ({ page }) => {
  await page.getByTestId('bump-store').click()

  await expect(page.getByTestId('counts')).toHaveText('inits: 1, effects: 2')
})

test('destroys the previous tree on re-render', async ({ page }) => {
  await page.getByTestId('untrack').click()
  await expect(page.getByTestId('tracked')).toContainText('A component with no slots')

  await page.getByTestId('bump-store').click()

  // The unmounted tree's effect must not still be running.
  await expect(page.getByTestId('counts')).toHaveText('inits: 1, effects: 1')
})
