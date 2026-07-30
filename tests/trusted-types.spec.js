import { expect, test } from '@playwright/test'

// The only scenarios that need their own fixture. A Trusted Types policy has to arrive as a
// response header, so it cannot be set from inside index.html, and enforcement rules out
// Alpine's default build entirely — see tests/fixtures/trusted-types.html.

const FIXTURE_PATH = 'trusted-types.html'
const ENFORCED_POLICY = "require-trusted-types-for 'script'"

async function gotoWithPolicy(page, trustedTypesDirective, { usesProbe = false } = {}) {
  const consoleMessages = []

  // Firefox attributes its own engine deprecation warnings to whatever script was on the stack,
  // which here is Alpine's bundle. Dropping foreign warnings keeps what the specs below actually
  // read: the plugin's own warning, and any hard error a refused assignment would raise.
  page.on('console', (consoleMessage) => {
    const isForeignWarning =
      consoleMessage.type() === 'warning' && !consoleMessage.text().includes('[alpinejs-component]')

    if (isForeignWarning) {
      return
    }

    consoleMessages.push(consoleMessage.text())
  })

  await page.route(`**/${FIXTURE_PATH}*`, async (route) => {
    const originalResponse = await route.fetch()

    await route.fulfill({
      response: originalResponse,
      headers: {
        ...originalResponse.headers(),
        'content-security-policy': `${trustedTypesDirective}; ${ENFORCED_POLICY}`,
      },
    })
  })

  await page.goto(usesProbe ? `${FIXTURE_PATH}?probe=1` : FIXTURE_PATH)

  return consoleMessages
}

// Without this, every assertion below would hold just as well on a page no policy ever reached.
test('the fixture really is under an enforced policy', async ({ page }) => {
  await gotoWithPolicy(page, 'trusted-types alpinejs-component', { usesProbe: true })

  expect(await page.evaluate(() => globalThis.isTrustedTypesEnforced)).toBe(true)
})

test('renders under an enforced Trusted Types policy', async ({ page }) => {
  const consoleMessages = await gotoWithPolicy(page, 'trusted-types alpinejs-component')

  await expect(page.getByTestId('trusted-types-card-title')).toHaveText('Ada')
  await expect(page.getByTestId('trusted-types-slot-content')).toHaveText('projected')
  await expect(page.locator('slot')).toHaveCount(0)

  expect(consoleMessages).toEqual([])
})

// Without the guard in createMarkupPolicy(), createPolicy() throws while the module is still
// being evaluated, which takes the whole plugin down rather than this one page.
test('warns instead of throwing when the policy name is not allowed', async ({ page }) => {
  const pageErrors = []

  page.on('pageerror', (pageError) => pageErrors.push(pageError.message))

  const consoleMessages = await gotoWithPolicy(page, 'trusted-types someone-else')

  await expect(page.getByTestId('trusted-types-host')).toBeEmpty()

  expect(consoleMessages).toContainEqual(
    expect.stringContaining('[alpinejs-component] Could not create a Trusted Types policy'),
  )
  expect(pageErrors).toEqual([])
})
