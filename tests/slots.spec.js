import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('index.html')
  await expect(page.getByTestId('slotted-card-host').locator('.card')).toBeVisible()
})

test('projects default and named slot content', async ({ page }) => {
  await expect(page.getByTestId('slot-owner-name')).toHaveText('Ada')
  await expect(page.getByTestId('slotted-card-host').locator('footer')).toContainText(
    'Rename owner',
  )
})

test('falls back to the slot children when nothing matches', async ({ page }) => {
  await expect(page.getByTestId('slotted-card-host').locator('aside')).toHaveText(
    'Fallback content for an unfilled slot',
  )
})

test('leaves no slot elements behind', async ({ page }) => {
  await expect(page.locator('slot')).toHaveCount(0)
})

test('removes the slot templates from the host', async ({ page }) => {
  await expect(page.locator('[data-testid] > template[x-slot]')).toHaveCount(0)
})

test('merges duplicate slot names in document order', async ({ page }) => {
  await expect(
    page.getByTestId('duplicate-slots-host').locator('footer .duplicate-item'),
  ).toHaveText(['one', 'two'])
})

test('evaluates slot content in the host scope, not the component scope', async ({ page }) => {
  // The component declares x-data="{ owner: 'component-scope' }" around the slot.
  await expect(page.getByTestId('slot-owner-name')).not.toHaveText('component-scope')
})

test('fills a slot nested in an x-for, once per iteration', async ({ page }) => {
  await expect(page.getByTestId('looped-card-host').locator('.looped-slot-owner')).toHaveCount(2)
})

test('slot content inside x-for evaluates in the component scope, not the host scope', async ({
  page,
}) => {
  // Documents a known divergence rather than the behaviour we want. Alpine clones the x-for
  // template, and addScopeToNode's marker is an expando that cloneNode drops, so the host
  // binding is lost. Fixing it means carrying the scope on an attribute instead; this test
  // has to be updated deliberately when that happens.
  await expect(page.getByTestId('looped-card-host').locator('.looped-slot-owner')).toHaveText([
    'component-scope',
    'component-scope',
  ])
})

test('slot content drives host state', async ({ page }) => {
  await page.getByTestId('rename-owner-button').click()

  await expect(page.getByTestId('slot-owner-name')).toHaveText('Grace')
})

test('re-projects slots across re-renders', async ({ page }) => {
  await expect(page.getByTestId('dynamic-slot-label')).toHaveText('first')

  // A component with no slots at all must not consume the captured content.
  await page.getByTestId('show-slotless-button').click()
  await expect(page.getByTestId('dynamic-view-host')).toContainText('A component with no slots')

  await page.getByTestId('show-view-b-button').click()
  await expect(page.getByTestId('dynamic-slot-label')).toHaveText('first')
})

test('keeps slot content reactive to host state', async ({ page }) => {
  await page.getByTestId('relabel-slot-button').click()

  await expect(page.getByTestId('dynamic-slot-label')).toHaveText('updated')
})
