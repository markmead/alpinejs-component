import { expect, test } from '@playwright/test'

// The only scenarios that need their own fixture. A Trusted Types policy has to arrive as a
// response header, so it cannot be set from inside index.html, and enforcement rules out
// Alpine's default build entirely — see tests/fixtures/trusted-types.html.

const FIXTURE_PATH = 'trusted-types.html'
const ENFORCED_POLICY = "require-trusted-types-for 'script'"

async function gotoWithPolicy(page, trustedTypesDirective) {
  const consoleMessages = []

  page.on('console', (consoleMessage) => consoleMessages.push(consoleMessage.text()))

  await page.route(`**/${FIXTURE_PATH}`, async (route) => {
    const originalResponse = await route.fetch()

    await route.fulfill({
      response: originalResponse,
      headers: {
        ...originalResponse.headers(),
        'content-security-policy': `${trustedTypesDirective}; ${ENFORCED_POLICY}`,
      },
    })
  })

  await page.goto(FIXTURE_PATH)

  return consoleMessages
}

test('renders under an enforced Trusted Types policy', async ({ page }) => {
  const consoleMessages = await gotoWithPolicy(page, 'trusted-types alpinejs-component')

  await expect(page.getByTestId('tt-title')).toHaveText('Ada')
  await expect(page.getByTestId('tt-slot')).toHaveText('projected')
  await expect(page.locator('slot')).toHaveCount(0)

  expect(consoleMessages).toEqual([])
})

// Without the guard in createMarkupPolicy(), createPolicy() throws while the module is still
// being evaluated, which takes the whole plugin down rather than this one page.
test('warns instead of throwing when the policy name is not allowed', async ({ page }) => {
  const pageErrors = []

  page.on('pageerror', (pageError) => pageErrors.push(pageError.message))

  const consoleMessages = await gotoWithPolicy(page, 'trusted-types someone-else')

  await expect(page.getByTestId('tt')).toBeEmpty()

  expect(consoleMessages).toContainEqual(
    expect.stringContaining('[alpinejs-component] Could not create a Trusted Types policy'),
  )
  expect(pageErrors).toEqual([])
})
