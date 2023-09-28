import { initStyles } from './initStyles'
import { initTemplate, initUrl } from './initTemplate'

export default function (Alpine) {
  class ComponentWrapper extends HTMLElement {
    connectedCallback() {
      const shadowDom = this.attachShadow({ mode: 'open' })

      const hasDynamicTemplate = this.hasAttribute(':template')
      const hasDynamicUrl = this.hasAttribute(':url')

      if (hasDynamicTemplate || hasDynamicUrl) {
        Alpine.initTree(this)
      }

      const {
        template: componentTemplate = { value: '' },
        url: componentUrl = { value: '' },
        styles: componentStyles = { value: '' },
      } = this.attributes

      const [templateName, templateStyled] = componentTemplate.value.split(':')
      const [urlName, urlStyled] = componentUrl.value.split(':')

      if (templateName) {
        initTemplate(Alpine, templateName, shadowDom)
      }

      if (urlName) {
        initUrl(Alpine, urlName, shadowDom)
      }

      const styleTargets = componentStyles.value.split(',')

      initStyles(shadowDom, styleTargets)

      if (templateStyled || urlStyled) {
      }
    }
  }

  if (window.customElements.get('x-component')) {
    return
  }

  customElements.define('x-component', ComponentWrapper)

  new ComponentWrapper()
}
