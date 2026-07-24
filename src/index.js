import { loadFromTemplate, loadFromUrl } from './template'

const DEFAULT_SLOT_NAME = 'default'

export default function (Alpine) {
  function resolveSourceValue(sourceExpression, evaluateExpression) {
    if (!sourceExpression) {
      return ''
    }

    try {
      const evaluatedValue = evaluateExpression(sourceExpression)

      if (typeof evaluatedValue === 'string') {
        return evaluatedValue.trim()
      }

      if (evaluatedValue === null || typeof evaluatedValue === 'undefined') {
        return ''
      }

      return String(evaluatedValue)
    } catch (evaluationError) {
      console.error(
        `[alpinejs-component] Failed to evaluate expression: ${sourceExpression}`,
        evaluationError,
      )

      return {
        value: '',
        error: evaluationError,
      }
    }
  }

  function dispatchLifecycleEvent(hostElement, eventName, eventDetail = {}) {
    hostElement.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        detail: eventDetail,
      }),
    )
  }

  // Slot templates are removed from the host up front because rendering takes over its children.
  function captureSlotContent(hostElement) {
    const slotTemplateNodes = [...hostElement.querySelectorAll(':scope > template[x-slot]')]
    const capturedSlotContent = new Map()

    for (const slotTemplateNode of slotTemplateNodes) {
      const slotName = (slotTemplateNode.getAttribute('x-slot') || '').trim() || DEFAULT_SLOT_NAME
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

  function fillSlots(componentFragment, capturedSlotContent, hostElement) {
    const slotNodes = [...componentFragment.querySelectorAll('slot')]

    for (const slotNode of slotNodes) {
      const slotName = (slotNode.getAttribute('name') || '').trim() || DEFAULT_SLOT_NAME
      const slotContent = capturedSlotContent.get(slotName)

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

  Alpine.directive(
    'component',
    (hostElement, { expression, modifiers }, { effect, cleanup, evaluate }) => {
      const capturedSlotContent = captureSlotContent(hostElement)

      let currentRenderToken = 0
      let mountedNodes = []

      function unmountComponent() {
        if (!mountedNodes.length) {
          return
        }

        // Alpine's mutation observer is paused so it can't double-handle these nodes.
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

      function mountComponent(componentFragment) {
        const componentNodes = [...componentFragment.childNodes]

        unmountComponent()

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

      effect(() => {
        const resolvedSource = resolveSourceValue(expression, evaluate)
        const componentSource =
          typeof resolvedSource === 'string' ? resolvedSource : resolvedSource.value

        if (typeof resolvedSource === 'object' && resolvedSource.error) {
          dispatchLifecycleEvent(hostElement, 'x-component:error', {
            source: expression,
            error: resolvedSource.error,
          })
        }

        if (!componentSource.length) {
          unmountComponent()

          return
        }

        const renderTokenAtStart = ++currentRenderToken

        ;(async () => {
          const usesUrlModifier = modifiers.includes('url')

          try {
            if (usesUrlModifier) {
              dispatchLifecycleEvent(hostElement, 'x-component:loading', {
                source: componentSource,
              })
            }

            const componentFragment = usesUrlModifier
              ? await loadFromUrl(componentSource, {
                  allowCrossOrigin: modifiers.includes('external'),
                })
              : loadFromTemplate(componentSource)

            if (renderTokenAtStart !== currentRenderToken) {
              return
            }

            if (!componentFragment) {
              const renderError = new Error(
                `Component source resolved but no fragment was returned: ${componentSource}`,
              )

              unmountComponent()

              console.error(
                `[alpinejs-component] Failed to render component: ${componentSource}`,
                renderError,
              )

              dispatchLifecycleEvent(hostElement, 'x-component:error', {
                source: componentSource,
                error: renderError,
              })

              return
            }

            fillSlots(componentFragment, capturedSlotContent, hostElement)

            mountComponent(componentFragment)

            dispatchLifecycleEvent(hostElement, 'x-component:loaded', {
              source: componentSource,
            })
          } catch (renderError) {
            console.error(
              `[alpinejs-component] Failed to render component: ${componentSource}`,
              renderError,
            )

            dispatchLifecycleEvent(hostElement, 'x-component:error', {
              source: componentSource,
              error: renderError,
            })
          }
        })()
      })

      cleanup(() => {
        currentRenderToken += 1

        unmountComponent()
      })
    },
  )
}
