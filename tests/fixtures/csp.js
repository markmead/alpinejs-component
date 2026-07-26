// The policy on csp.html has no 'unsafe-inline', so this page cannot register anything from a
// <script> block the way tests/fixtures/index.html does.

globalThis.cspViolations = []
globalThis.lifecycleEvents = []

// Playwright's page.evaluate is exempt from the page's policy, so proving the policy is really
// enforced has to happen in a script the page loaded itself.
globalThis.isEvalBlocked = false

try {
  new Function('return 1')()
} catch {
  globalThis.isEvalBlocked = true
}

document.addEventListener('securitypolicyviolation', (violationEvent) => {
  // The probe above trips the policy on purpose. Nothing else on this page should evaluate a
  // string, and if the plugin ever did, rendering would fail long before this listener mattered.
  if (violationEvent.blockedURI === 'eval') {
    return
  }

  globalThis.cspViolations.push(
    `${violationEvent.effectiveDirective}: ${violationEvent.blockedURI}`,
  )
})

for (const eventName of ['x-component:loading', 'x-component:loaded', 'x-component:error']) {
  document.addEventListener(eventName, (lifecycleEvent) =>
    globalThis.lifecycleEvents.push(lifecycleEvent.type),
  )
}

document.addEventListener('alpine:init', () => {
  Alpine.data('cardHost', () => ({
    person: { name: 'Ada' },
    cardName: 'csp-card',
    label: 'first',

    showAltCard() {
      this.cardName = 'csp-alt-card'
    },

    clearCard() {
      this.cardName = ''
    },

    relabel() {
      this.label = 'updated'
    },
  }))

  // Only ever reached from inside a component template, so a slot that resolves to 'component'
  // instead of the host's label is a projection bug.
  Alpine.data('cardScope', () => ({ label: 'component-scope' }))

  Alpine.data('remoteHost', () => ({
    item: { name: 'Remote' },
    cardUrl: 'remote-card.html',
  }))
})
