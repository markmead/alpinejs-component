export function dispatchLifecycleEvent(hostElement, eventName, eventDetail = {}) {
  hostElement.dispatchEvent(
    new CustomEvent(eventName, {
      bubbles: true,
      // Lets the event escape if the host itself sits inside someone else's shadow root.
      composed: true,
      detail: eventDetail,
    }),
  )
}

export function reportRenderError(hostElement, componentSource, renderError) {
  console.error(`[alpinejs-component] Failed to render component: ${componentSource}`, renderError)

  dispatchLifecycleEvent(hostElement, 'x-component:error', {
    source: componentSource,
    error: renderError,
  })
}
