import { dispatchLifecycleEvent, reportRenderError } from './events'
import { createComponentRenderer } from './render'
import { createSlotProjector } from './slots'
import { resolveSourceValue } from './source'
import { loadFromTemplate, loadFromUrl } from './template'

export default function (Alpine) {
  function componentDirective(hostElement, directiveMeta, directiveUtilities) {
    const { expression, modifiers } = directiveMeta
    const { effect, cleanup, evaluate } = directiveUtilities

    const slotProjector = createSlotProjector(Alpine, hostElement)
    const componentRenderer = createComponentRenderer(Alpine, hostElement)

    const usesUrlModifier = modifiers.includes('url')
    const allowsCrossOrigin = modifiers.includes('external')

    // Guards against a slow render landing after a newer one has already started.
    let currentRenderToken = 0

    async function renderComponent(componentSource, renderToken) {
      try {
        if (usesUrlModifier) {
          dispatchLifecycleEvent(hostElement, 'x-component:loading', { source: componentSource })
        }

        const componentFragment = usesUrlModifier
          ? await loadFromUrl(componentSource, { allowCrossOrigin: allowsCrossOrigin })
          : loadFromTemplate(componentSource)

        if (renderToken !== currentRenderToken) {
          return
        }

        if (!componentFragment) {
          componentRenderer.unmount()

          reportRenderError(
            hostElement,
            componentSource,
            new Error(`Component source resolved but no fragment was returned: ${componentSource}`),
          )

          return
        }

        slotProjector.fillSlots(componentFragment)
        componentRenderer.mount(componentFragment)

        dispatchLifecycleEvent(hostElement, 'x-component:loaded', { source: componentSource })
      } catch (renderError) {
        if (renderToken !== currentRenderToken) {
          return
        }

        reportRenderError(hostElement, componentSource, renderError)
      }
    }

    effect(() => {
      const componentSource = resolveSourceValue(expression, evaluate)

      if (!componentSource.length) {
        currentRenderToken += 1

        componentRenderer.unmount()

        return
      }

      renderComponent(componentSource, ++currentRenderToken)
    })

    cleanup(() => {
      currentRenderToken += 1

      componentRenderer.unmount()
    })
  }

  Alpine.directive('component', componentDirective)
}
