import { expect, test } from '@playwright/test'

// Alpine's CSP build swaps in an evaluator that never reaches for new Function, so it needs a
// page of its own: index.html loads the default build, which the policy here would stop dead.
// The README promises the plugin works with that build — this is what backs the promise up.

test.beforeEach(async ({ page }) => {
  await page.goto('csp.html')
  await expect(page.getByTestId('csp-dynamic').locator('.card')).toBeVisible()
})

// Without this, every other test here could be passing under no policy at all.
test('the fixture really does block eval', async ({ page }) => {
  expect(await page.evaluate(() => globalThis.isEvalBlocked)).toBe(true)
})

test('renders an on-page template with no CSP violations', async ({ page }) => {
  await expect(page.getByTestId('csp-title')).toHaveText('Ada')

  expect(await page.evaluate(() => globalThis.cspViolations)).toEqual([])
})

test('renders a literal source expression', async ({ page }) => {
  await expect(page.getByTestId('csp-literal')).toContainText('Alternative card')
})

test('re-renders when the source property changes', async ({ page }) => {
  await page.getByTestId('csp-swap').click()

  await expect(page.getByTestId('csp-dynamic')).toContainText('Alternative card')
  await expect(page.getByTestId('csp-dynamic').locator('> *')).toHaveCount(1)
})

test('unmounts when the source property empties', async ({ page }) => {
  await page.getByTestId('csp-clear').click()

  await expect(page.getByTestId('csp-dynamic')).toBeEmpty()
})

test('projects default, named and unfilled slots', async ({ page }) => {
  await expect(page.getByTestId('csp-label')).toHaveText('first')
  await expect(page.getByTestId('csp-dynamic').locator('footer')).toContainText('Relabel')
  await expect(page.getByTestId('csp-unfilled')).toHaveText('Fallback content')
  await expect(page.locator('slot')).toHaveCount(0)
})

test('slot content evaluates in the host scope, not the component scope', async ({ page }) => {
  // The component wraps its slots in x-data="cardScope", which declares its own label.
  await expect(page.getByTestId('csp-label')).not.toHaveText('component-scope')
})

test('slot content drives host state', async ({ page }) => {
  await page.getByTestId('csp-relabel').click()

  await expect(page.getByTestId('csp-label')).toHaveText('updated')
})

test('re-projects slots across a re-render', async ({ page }) => {
  await page.getByTestId('csp-swap').click()

  await expect(page.getByTestId('csp-label')).toHaveText('first')
})

test('renders a URL source and emits its lifecycle events', async ({ page }) => {
  await expect(page.getByTestId('csp-remote').locator('.remote h2')).toHaveText('Remote')
  await expect(page.getByTestId('csp-remote-slot')).toBeVisible()

  expect(await page.evaluate(() => globalThis.lifecycleEvents)).toContain('x-component:loading')
  expect(await page.evaluate(() => globalThis.lifecycleEvents)).toContain('x-component:loaded')
})
