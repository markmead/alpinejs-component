import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('index.html')
  await expect(page.getByTestId('slots').locator('.card')).toBeVisible()
})

test('projects default and named slot content', async ({ page }) => {
  await expect(page.getByTestId('slot-owner')).toHaveText('Ada')
  await expect(page.getByTestId('slots').locator('footer')).toContainText('Rename owner')
})

test('falls back to the slot children when nothing matches', async ({ page }) => {
  await expect(page.getByTestId('slots').locator('aside')).toHaveText(
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
  await expect(page.getByTestId('duplicate').locator('footer .dupe')).toHaveText(['one', 'two'])
})

test('evaluates slot content in the host scope, not the component scope', async ({ page }) => {
  // The component declares x-data="{ owner: 'component-scope' }" around the slot.
  await expect(page.getByTestId('slot-owner')).not.toHaveText('component-scope')
})

test('slot content drives host state', async ({ page }) => {
  await page.getByTestId('rename-owner').click()

  await expect(page.getByTestId('slot-owner')).toHaveText('Grace')
})

test('re-projects slots across re-renders', async ({ page }) => {
  await expect(page.getByTestId('dynamic-label')).toHaveText('first')

  // A component with no slots at all must not consume the captured content.
  await page.getByTestId('view-slotless').click()
  await expect(page.getByTestId('dynamic')).toContainText('A component with no slots')

  await page.getByTestId('view-b').click()
  await expect(page.getByTestId('dynamic-label')).toHaveText('first')
})

test('keeps slot content reactive to host state', async ({ page }) => {
  await page.getByTestId('relabel').click()

  await expect(page.getByTestId('dynamic-label')).toHaveText('updated')
})
