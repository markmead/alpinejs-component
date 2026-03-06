import { initStyles } from './styles'
import { loadFromTemplate, loadFromUrl } from './template'

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
    } catch {
      // Keep support for non-quoted static values: x-component="person"
      return sourceExpression.trim()
    }
  }

  function getStyleTargets(hostElement) {
    const styleValue =
      hostElement.getAttribute('x-component-styles') ||
      hostElement.getAttribute('styles') ||
      ''

    return styleValue
      .split(',')
      .map((styleTargetName) => styleTargetName.trim())
      .filter(Boolean)
  }

  function dispatchLifecycleEvent(hostElement, eventName, eventDetail = {}) {
    hostElement.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        detail: eventDetail,
      }),
    )
  }

  function clearProjectedSlots(hostElement) {
    const projectedSlotNodes = hostElement._x_componentSlots || []

    for (const projectedSlotNode of projectedSlotNodes) {
      projectedSlotNode.remove()
    }

    hostElement._x_componentSlots = []
  }

  function projectSlots(hostElement) {
    clearProjectedSlots(hostElement)

    const slotTemplateNodes = [
      ...hostElement.querySelectorAll(':scope > template[x-slot]'),
    ]

    if (!slotTemplateNodes.length) {
      return
    }

    const projectedSlotNodes = []

    for (const slotTemplateNode of slotTemplateNodes) {
      const slotName = (slotTemplateNode.getAttribute('x-slot') || '').trim()
      const slotContentFragment = slotTemplateNode.content.cloneNode(true)
      const slotContentNodes = [...slotContentFragment.childNodes]

      if (slotName.length) {
        for (const slotContentNode of slotContentNodes) {
          if (slotContentNode.nodeType === Node.ELEMENT_NODE) {
            slotContentNode.setAttribute('slot', slotName)
          }
        }
      }

      slotTemplateNode.after(slotContentFragment)
      projectedSlotNodes.push(...slotContentNodes)
    }

    hostElement._x_componentSlots = projectedSlotNodes
  }

  Alpine.directive(
    'component',
    (
      hostElement,
      { expression: sourceExpression, modifiers: directiveModifiers },
      {
        effect: createReactiveEffect,
        cleanup: registerCleanup,
        evaluate: evaluateExpression,
      },
    ) => {
      let currentRenderToken = 0
      let hasMountedTree = false

      createReactiveEffect(() => {
        const componentSource = resolveSourceValue(
          sourceExpression,
          evaluateExpression,
        )

        if (!componentSource.length) {
          if (hostElement.shadowRoot && hasMountedTree) {
            Alpine.destroyTree(hostElement.shadowRoot)
            hostElement.shadowRoot.replaceChildren()

            hasMountedTree = false
          }

          return
        }

        const renderTokenAtStart = ++currentRenderToken

        ;(async () => {
          const usesUrlModifier = directiveModifiers.includes('url')

          try {
            if (usesUrlModifier) {
              dispatchLifecycleEvent(hostElement, 'x-component:loading', {
                source: componentSource,
              })
            }

            const componentFragment = usesUrlModifier
              ? await loadFromUrl(componentSource)
              : loadFromTemplate(componentSource)

            if (
              !componentFragment ||
              renderTokenAtStart !== currentRenderToken
            ) {
              return
            }

            const shadowRootNode =
              hostElement.shadowRoot ||
              hostElement.attachShadow({ mode: 'open' })

            if (hasMountedTree) {
              Alpine.destroyTree(shadowRootNode)
            }

            // Allow component templates to access host Alpine scopes.
            Alpine.addScopeToNode(shadowRootNode, {}, hostElement)

            projectSlots(hostElement)

            shadowRootNode.replaceChildren(componentFragment)

            const styleTargetNames = getStyleTargets(hostElement)

            if (styleTargetNames.length) {
              initStyles(shadowRootNode, styleTargetNames)
            }

            Alpine.initTree(shadowRootNode)

            hasMountedTree = true

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

      registerCleanup(() => {
        currentRenderToken += 1

        clearProjectedSlots(hostElement)

        if (hostElement.shadowRoot && hasMountedTree) {
          Alpine.destroyTree(hostElement.shadowRoot)
        }
      })
    },
  )
}
