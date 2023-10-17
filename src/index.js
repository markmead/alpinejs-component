import { initStyles } from './initStyles'
import { initTemplate, initUrl } from './initTemplate'

export default function (Alpine) {
  class ComponentWrapper extends HTMLElement {
    connectedCallback() {
      if (this._init) {
        return;
      }

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

      const templateName = componentTemplate.value
      const urlName = componentUrl.value
      const styleNames = componentStyles.value.split(',')

      if (templateName.length) {
        initTemplate(Alpine, templateName, shadowDom)
      }

      if (urlName.length) {
        initUrl(Alpine, urlName, shadowDom)
      }

      if (styleNames.length) {
        initStyles(shadowDom, styleNames)
      }

      this._init = true;
    }
  }

  if (window.customElements.get('x-component')) {
    return
  }

  customElements.define('x-component', ComponentWrapper)

  new ComponentWrapper()
}
