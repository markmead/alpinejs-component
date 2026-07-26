// Every fixture page loads tests/fixtures/lifecycle-log.js, so this reads the same log whichever
// page the spec is driving.
export function lifecycleEventsFor(page, testId) {
  return page.evaluate(
    (targetTestId) => globalThis.lifecycleEvents.filter((event) => event.testId === targetTestId),
    testId,
  )
}
