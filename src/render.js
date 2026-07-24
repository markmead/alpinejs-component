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

    Alpine.mutateDom(() => {
      hostElement.replaceChildren(componentFragment)

      for (const componentNode of componentNodes) {
        if (componentNode.nodeType === Node.ELEMENT_NODE) {
          Alpine.initTree(componentNode)
        }
      }
    })

    mountedNodes = componentNodes
  }

  return { mount, unmount }
}
