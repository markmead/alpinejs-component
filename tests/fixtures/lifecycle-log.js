// Recorded from the document so nothing depends on directive init order. Loaded by every fixture
// page, so one spec helper can read the log whichever page produced it.

globalThis.lifecycleEvents = []

for (const eventName of ['x-component:loading', 'x-component:loaded', 'x-component:error']) {
  document.addEventListener(eventName, ({ target, type, detail }) => {
    globalThis.lifecycleEvents.push({
      testId: target.dataset.testid || null,
      type,
      source: detail.source,
      error: detail.error ? String(detail.error.message || detail.error) : null,
    })
  })
}
