const DEFAULT_SLOT_NAME = 'default'

function readSlotName(slotElement, attributeName) {
  return (slotElement.getAttribute(attributeName) || '').trim() || DEFAULT_SLOT_NAME
}

// Slot templates are taken off the host up front, because rendering takes over its children.
function captureSlotContent(Alpine, hostElement) {
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
  }

  if (slotTemplateNodes.length) {
    Alpine.mutateDom(() => {
      for (const slotTemplateNode of slotTemplateNodes) {
        slotTemplateNode.remove()
      }
    })
  }

  return capturedSlotContent
}

// querySelectorAll treats a <template>'s content as a separate document, so it walks past
// any <slot> inside one. Those slots have to be collected by hand or an x-for/x-if wrapped
// around a slot silently renders nothing.
function collectSlotNodes(rootNode) {
  const slotNodes = [...rootNode.querySelectorAll('slot')]

  for (const nestedTemplate of rootNode.querySelectorAll('template')) {
    slotNodes.push(...collectSlotNodes(nestedTemplate.content))
  }

  return slotNodes
}

export function createSlotProjector(Alpine, hostElement) {
  const capturedSlotContent = captureSlotContent(Alpine, hostElement)

  function fillSlots(componentFragment) {
    const slotNodes = collectSlotNodes(componentFragment)

    for (const slotNode of slotNodes) {
      const slotContent = capturedSlotContent.get(readSlotName(slotNode, 'name'))

      if (!slotContent) {
        slotNode.replaceWith(...slotNode.childNodes)

        continue
      }

      const slotContentClone = slotContent.cloneNode(true)
      const projectedNodes = [...slotContentClone.childNodes]

      slotNode.replaceWith(slotContentClone)

      // Slot content is authored on the host, so it keeps evaluating against the host's scope
      // instead of the scope of whatever component it lands in.
      //
      // This does not reach content projected into an x-for or x-if template: addScopeToNode
      // records the binding as an expando, and Alpine clones those templates with cloneNode,
      // which drops it. Carrying the binding on an attribute instead would survive the clone.
      for (const projectedNode of projectedNodes) {
        if (projectedNode.nodeType === Node.ELEMENT_NODE) {
          Alpine.addScopeToNode(projectedNode, {}, hostElement)
        }
      }
    }
  }

  return { fillSlots }
}
