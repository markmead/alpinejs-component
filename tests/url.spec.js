import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('index.html')
  await expect(page.getByTestId('remote-card-host').locator('.remote')).toBeVisible()
})

test('renders a same-origin URL', async ({ page }) => {
  await expect(page.getByTestId('remote-card-host').locator('h2')).toHaveText('Watched')
})

test('projects slots into a remote template', async ({ page }) => {
  await expect(page.getByTestId('remote-card-host')).toContainText('Go')
})

test('blocks cross-origin URLs by default', async ({ page }) => {
  await expect(page.getByTestId('cross-origin-blocked-host')).toBeEmpty()
})

test('allows cross-origin URLs with the external modifier', async ({ page }) => {
  await expect(page.getByTestId('cross-origin-external-host').locator('h2')).toHaveText('External')
})

test('rejects non-http protocols', async ({ page }) => {
  await expect(page.getByTestId('unsupported-protocol-host')).toBeEmpty()
})

test('does not cache a failed fetch, so a retry can succeed', async ({ page }) => {
  await expect(page.getByTestId('retried-card-host')).toBeEmpty()

  await page.getByTestId('retry-with-real-url-button').click()

  // Reusing the same host proves the rejected promise was evicted from the cache.
  await expect(page.getByTestId('retried-card-host').locator('h2')).toHaveText('Retried')
})
