import { expect, test } from '@playwright/test'

import { lifecycleEventsFor } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('index.html')
  await expect(page.getByTestId('remote-card-host').locator('.remote')).toBeVisible()
})

test('emits loading then loaded for a URL component', async ({ page }) => {
  await expect
    .poll(() => lifecycleEventsFor(page, 'remote-card-host'))
    .toEqual([
      {
        testId: 'remote-card-host',
        type: 'x-component:loading',
        source: 'remote-card.html',
        error: null,
      },
      {
        testId: 'remote-card-host',
        type: 'x-component:loaded',
        source: 'remote-card.html',
        error: null,
      },
    ])
})

test('emits loaded without loading for an on-page template', async ({ page }) => {
  await expect
    .poll(() => lifecycleEventsFor(page, 'person-card-host'))
    .toEqual([
      {
        testId: 'person-card-host',
        type: 'x-component:loaded',
        source: 'person-card',
        error: null,
      },
    ])
})

test('lifecycle events bubble to an ancestor listener', async ({ page }) => {
  await expect(page.getByTestId('lifecycle-event-log')).toHaveText('loading → loaded')
})

test('emits an error when a URL fails to load', async ({ page }) => {
  await expect
    .poll(async () =>
      (await lifecycleEventsFor(page, 'retried-card-host')).map((event) => event.type),
    )
    .toEqual(['x-component:loading', 'x-component:error'])

  const [, errorEvent] = await lifecycleEventsFor(page, 'retried-card-host')

  expect(errorEvent.source).toBe('missing-card.html')
  expect(errorEvent.error).toContain('404')
})

test('emits an error when a cross-origin URL is blocked', async ({ page }) => {
  const [, errorEvent] = await lifecycleEventsFor(page, 'cross-origin-blocked-host')

  expect(errorEvent.type).toBe('x-component:error')
  expect(errorEvent.error).toContain('Cross-origin URL blocked')
})

// Pre-existing, and unchanged by the move to the light DOM. Alpine's evaluator catches the
// throw itself and reports it out of band, so resolveSourceValue() never sees it and no
// x-component:error is emitted. Locked in here so a future fix has to update this test
// deliberately rather than by accident.
test('a throwing expression renders nothing and emits no error event', async ({ page }) => {
  await expect(page.getByTestId('throwing-expression-host')).toBeEmpty()

  expect(await lifecycleEventsFor(page, 'throwing-expression-host')).toEqual([])
})
