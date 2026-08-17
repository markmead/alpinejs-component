function destroyElementTrees(Alpine, nodesToDestroy) {
  for (const nodeToDestroy of nodesToDestroy) {
    if (nodeToDestroy.nodeType === Node.ELEMENT_NODE) {
      Alpine.destroyTree(nodeToDestroy)
    }
  }
}

export function createComponentRenderer(Alpine, hostElement) {
  let mountedNodes = []

  function unmount() {
    if (!mountedNodes.length) {
      return
    }

    // Alpine's mutation observer is paused so it can't double-handle nodes we manage ourselves.
    Alpine.mutateDom(() => {
      destroyElementTrees(Alpine, mountedNodes)

      for (const mountedNode of mountedNodes) {
        mountedNode.remove()
      }
    })

    mountedNodes = []
  }

  function mount(componentFragment) {
    const componentNodes = [...componentFragment.childNodes]
    const previouslyMountedNodes = new Set(mountedNodes)

    // Whatever else is on the host is content we never mounted, such as a loading placeholder.
    const discardedHostElements = [...hostElement.children].filter(
      (hostChildElement) => !previouslyMountedNodes.has(hostChildElement),
    )

    // Both sets are torn down without detaching them individually — replaceChildren below does
    // the single detach for the whole host in one operation, and Alpine's observer never sees
    // those nodes leave since all of this runs inside one mutateDom.
    Alpine.mutateDom(() => {
      destroyElementTrees(Alpine, mountedNodes)
      destroyElementTrees(Alpine, discardedHostElements)

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
          destroyElementTrees(Alpine, discardedHostElements)
        })
      })
    }
  }

  return { mount, unmount }
}
