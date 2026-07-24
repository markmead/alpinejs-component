const DEFAULT_SLOT_NAME = 'default'

function readSlotName(slotElement, attributeName) {
  return (slotElement.getAttribute(attributeName) || '').trim() || DEFAULT_SLOT_NAME
}

// Slot templates are taken off the host up front, because rendering takes over its children.
function captureSlotContent(hostElement) {
  const slotTemplateNodes = [...hostElement.querySelectorAll(':scope > template[x-slot]')]
  const capturedSlotContent = new Map()

  for (const slotTemplateNode of slotTemplateNodes) {
    const slotName = readSlotName(slotTemplateNode, 'x-slot')
    const existingSlotContent = capturedSlotContent.get(slotName)

    if (existingSlotContent) {
      existingSlotContent.append(...slotTemplateNode.content.childNodes)
    } else {
      capturedSlotContent.set(slotName, slotTemplateNode.content)
    }

    slotTemplateNode.remove()
  }

  return capturedSlotContent
}

export function createSlotProjector(Alpine, hostElement) {
  const capturedSlotContent = captureSlotContent(hostElement)

  function fillSlots(componentFragment) {
    const slotNodes = [...componentFragment.querySelectorAll('slot')]

    for (const slotNode of slotNodes) {
      const slotContent = capturedSlotContent.get(readSlotName(slotNode, 'name'))

      if (!slotContent) {
        // Unfilled slots fall back to their own children, the same as a native <slot>.
        slotNode.replaceWith(...slotNode.childNodes)

        continue
      }

      const slotContentClone = slotContent.cloneNode(true)
      const projectedNodes = [...slotContentClone.childNodes]

      slotNode.replaceWith(slotContentClone)

      // Slot content is authored on the host, so it keeps evaluating against the host's scope
      // instead of the scope of whatever component it lands in.
      for (const projectedNode of projectedNodes) {
        if (projectedNode.nodeType === Node.ELEMENT_NODE) {
          Alpine.addScopeToNode(projectedNode, {}, hostElement)
        }
      }
    }
  }

  return { fillSlots }
}
