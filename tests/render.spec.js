import { expect, test } from '@playwright/test'

import { lifecycleEventsFor } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('index.html')
  await expect(page.getByTestId('person-card-host').locator('.card')).toBeVisible()
})

test('renders an on-page template into the host', async ({ page }) => {
  await expect(page.getByTestId('person-card-host').locator('h3')).toHaveText('John')
})

test('renders into the light DOM rather than a shadow root', async ({ page }) => {
  const hasShadowRoot = await page
    .getByTestId('person-card-host')
    .evaluate((host) => Boolean(host.shadowRoot))

  expect(hasShadowRoot).toBe(false)
})

test('component content evaluates against the host scope', async ({ page }) => {
  await expect(page.getByTestId('person-card-host').locator('li')).toHaveText(['JavaScript', 'CSS'])
})

test('re-renders when the expression changes', async ({ page }) => {
  await expect(page.getByTestId('dynamic-view-host').locator('.card')).toContainText('View A')

  await page.getByTestId('show-view-b-button').click()

  await expect(page.getByTestId('dynamic-view-host').locator('.card')).toContainText('View B')
  await expect(page.getByTestId('dynamic-view-host').locator('> *')).toHaveCount(1)
})

test('unmounts when the expression resolves to empty', async ({ page }) => {
  await page.getByTestId('clear-view-button').click()

  await expect(page.getByTestId('dynamic-view-host')).toBeEmpty()
})

test('trims whitespace around the resolved source', async ({ page }) => {
  await expect(page.getByTestId('coerced-source-host').locator('.card')).toContainText(
    'named by a padded string',
  )
})

test('coerces a non-string source to a string', async ({ page }) => {
  await page.getByTestId('use-object-source-button').click()

  await expect(page.getByTestId('coerced-source-host').locator('.card')).toContainText(
    'named by an object',
  )
})

test('treats a non-string source that stringifies to whitespace as empty', async ({ page }) => {
  await page.getByTestId('use-blank-source-button').click()

  await expect(page.getByTestId('coerced-source-host')).toBeEmpty()

  // The lone loaded event from the first render is the positive control. Trimming only strings
  // would send '   ' on to be looked up as a template id, and the miss would add an error here.
  const lifecycleEventTypes = (await lifecycleEventsFor(page, 'coerced-source-host')).map(
    (lifecycleEvent) => lifecycleEvent.type,
  )

  expect(lifecycleEventTypes).toEqual(['x-component:loaded'])
})

test('renders nothing for a missing template', async ({ page }) => {
  await expect(page.getByTestId('missing-template-host')).toBeEmpty()
})

test('initializes mounted content exactly once', async ({ page }) => {
  // Alpine's mutation observer also sees light DOM writes, so a missing mutateDom wrapper
  // would initialize every node twice.
  await expect(page.getByTestId('probe-count-log')).toHaveText('inits: 1, effects: 1')
})

test('keeps mounted content reactive', async ({ page }) => {
  await page.getByTestId('bump-store-button').click()

  await expect(page.getByTestId('probe-count-log')).toHaveText('inits: 1, effects: 2')
})

test('destroys the previous tree on re-render', async ({ page }) => {
  await page.getByTestId('swap-away-button').click()
  await expect(page.getByTestId('tracked-card-host')).toContainText('A component with no slots')

  await page.getByTestId('bump-store-button').click()

  // The unmounted tree's effect must not still be running.
  await expect(page.getByTestId('probe-count-log')).toHaveText('inits: 1, effects: 1')
})
