export function createComponentRenderer(Alpine, hostElement) {
  let mountedNodes = []

  function unmount() {
    if (!mountedNodes.length) {
      return
    }

    // Alpine's mutation observer is paused so it can't double-handle nodes we manage ourselves.
    Alpine.mutateDom(() => {
      for (const mountedNode of mountedNodes) {
        if (mountedNode.nodeType === Node.ELEMENT_NODE) {
          Alpine.destroyTree(mountedNode)
        }

        mountedNode.remove()
      }
    })

    mountedNodes = []
  }

  function mount(componentFragment) {
    const componentNodes = [...componentFragment.childNodes]

    unmount()

    // Whatever is left on the host is content we never mounted, such as a loading placeholder.
    // Replacing it happens inside mutateDom, so Alpine's observer never sees those nodes leave
    // and their trees have to be torn down by hand.
    const discardedHostElements = [...hostElement.children]

    Alpine.mutateDom(() => {
      for (const discardedHostElement of discardedHostElements) {
        Alpine.destroyTree(discardedHostElement)
      }

      hostElement.replaceChildren(componentFragment)

      for (const componentNode of componentNodes) {
        if (componentNode.nodeType === Node.ELEMENT_NODE) {
          Alpine.initTree(componentNode)
        }
      }
    })

    mountedNodes = componentNodes

    // Alpine defers directive handlers FIFO, so a placeholder's own directives can still be
    // queued when a synchronous render detaches it. Destroying the discarded trees a second
    // time, once that queue has drained, collects the effects they attach on their way out.
    if (discardedHostElements.length) {
      queueMicrotask(() => {
        Alpine.mutateDom(() => {
          for (const discardedHostElement of discardedHostElements) {
            Alpine.destroyTree(discardedHostElement)
          }
        })
      })
    }
  }

  return { mount, unmount }
}
