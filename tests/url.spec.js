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

test('serves an already-loaded URL from the cache rather than refetching it', async ({ page }) => {
  const cachedCardHost = page.getByTestId('cached-card-host')

  // Settle both same-origin readers of remote-card.html before listening, so only what happens
  // after the swap is counted: the component itself, and the source panel that fetches the same
  // file to display it.
  await expect(cachedCardHost.locator('h2')).toHaveText('Cached')
  await expect(page.locator('[data-source-url="remote-card.html"]')).not.toBeEmpty()

  // Matched exactly rather than by substring, so the cross-origin copy on port 3211 is ignored.
  const cachedCardUrl = new URL('remote-card.html', page.url()).href

  const cardRequestUrls = []

  page.on('request', (pageRequest) => {
    if (pageRequest.url() === cachedCardUrl) {
      cardRequestUrls.push(pageRequest.url())
    }
  })

  await page.getByTestId('cache-swap-button').click()
  await expect(cachedCardHost.locator('h2')).toHaveText('Second remote template')

  await page.getByTestId('cache-swap-button').click()
  await expect(cachedCardHost.locator('h2')).toHaveText('Cached')

  expect(cardRequestUrls).toEqual([])
})

test('does not cache a failed fetch, so a retry can succeed', async ({ page }) => {
  await expect(page.getByTestId('retried-card-host')).toBeEmpty()

  await page.getByTestId('retry-with-real-url-button').click()

  // Reusing the same host proves the rejected promise was evicted from the cache.
  await expect(page.getByTestId('retried-card-host').locator('h2')).toHaveText('Retried')
})
