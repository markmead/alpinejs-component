// The policy on csp.html has no 'unsafe-inline', so this page cannot register anything from a
// <script> block the way tests/fixtures/index.html does.

globalThis.cspViolations = []

document.addEventListener('securitypolicyviolation', (violationEvent) => {
  globalThis.cspViolations.push(
    `${violationEvent.effectiveDirective}: ${violationEvent.blockedURI}`,
  )
})

// Playwright's page.evaluate is exempt from the page's policy, so the one violation this page
// expects has to be provoked by a script the page loaded itself. The spec asserts the record
// holds this and nothing else: empty would mean no policy is being enforced at all.
try {
  new Function('return 1')()
} catch {
  // The recorded violation is what the spec reads, not the throw.
}

document.addEventListener('alpine:init', () => {
  Alpine.data('cardHost', () => ({
    person: { name: 'Ada' },
    cardName: 'csp-card',
    label: 'first',

    showAltCard() {
      this.cardName = 'csp-alt-card'
    },

    relabel() {
      this.label = 'updated'
    },
  }))

  // Only ever reached from inside a component template, so a slot that resolves to
  // 'component-scope' instead of the host's label is a projection bug.
  Alpine.data('cardScope', () => ({ label: 'component-scope' }))

  Alpine.data('remoteHost', () => ({
    item: { name: 'Remote' },
    cardUrl: 'remote-card.html',
  }))
})
