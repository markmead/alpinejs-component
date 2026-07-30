import { expect, test } from '@playwright/test'

import { lifecycleEventsFor } from './helpers'

// Alpine's CSP build swaps in an evaluator that never reaches for new Function, so it needs a
// page of its own: index.html loads the default build, which the policy here would stop dead.
// The README promises the plugin works with that build — this is what backs the promise up.
//
// Only what the CSP build changes is tested here. Projection, unmounting and slot fallback are
// plain DOM work that the evaluator never touches, and slots.spec.js already owns them.

test.beforeEach(async ({ page }) => {
  await page.goto('csp.html')
  await expect(page.getByTestId('csp-card-host').locator('.card')).toBeVisible()
})

// Without this the rest of the file could be passing under no policy at all. The probe in csp.js
// is the only thing on the page allowed to trip the policy, so this doubles as the assertion that
// neither Alpine nor the plugin ever evaluates a string.
test('the policy is enforced, and only the probe violates it', async ({ page }) => {
  await expect
    .poll(() => page.evaluate(() => globalThis.cspViolations))
    .toEqual(['script-src: eval'])
})

test('renders a source held in a data property', async ({ page }) => {
  await expect(page.getByTestId('csp-card-title')).toHaveText('Ada')
})

test('renders a literal source expression', async ({ page }) => {
  await expect(page.getByTestId('csp-literal-host')).toContainText('Alternative card')
})

test('re-renders when the source property changes', async ({ page }) => {
  await page.getByTestId('csp-swap-button').click()

  await expect(page.getByTestId('csp-card-host')).toContainText('Alternative card')

  // Re-projected slot content is initialized again, so its x-text runs through the evaluator
  // a second time.
  await expect(page.getByTestId('csp-slot-label')).toHaveText('first')
})

test('slot content evaluates in the host scope, not the component scope', async ({ page }) => {
  // The component wraps its slots in x-data="cardScope", which declares its own label.
  await expect(page.getByTestId('csp-slot-label')).toHaveText('first')
})

test('slot content drives host state', async ({ page }) => {
  await page.getByTestId('csp-relabel-button').click()

  await expect(page.getByTestId('csp-slot-label')).toHaveText('updated')
})

test('renders a URL source and emits its lifecycle events', async ({ page }) => {
  await expect(page.getByTestId('csp-remote-host').locator('.remote h2')).toHaveText('Remote')
  await expect(page.getByTestId('csp-remote-slot-content')).toBeVisible()

  await expect
    .poll(async () =>
      (await lifecycleEventsFor(page, 'csp-remote-host')).map((event) => event.type),
    )
    .toEqual(['x-component:loading', 'x-component:loaded'])
})
