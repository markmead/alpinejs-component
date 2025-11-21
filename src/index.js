import { initStyles } from './initStyles'
import { initTemplate, initUrl } from './initTemplate'

export default function (Alpine) {
  class ComponentWrapper extends HTMLElement {
    connectedCallback() {
      // We prevent the component from being
      // initialized more than once
      if (this._hasInit) {
        return
      }

      const shadowDom = this.attachShadow({ mode: 'open' })

      const hasDynamicTemplate = this.hasAttribute(':template')
      const hasDynamicUrl = this.hasAttribute(':url')

      if (hasDynamicTemplate || hasDynamicUrl) {
        Alpine.initTree(this)
      }

      const {
        template: componentTemplate,
        url: componentUrl,
        styles: componentStyles,
      } = this.attributes || {}

      const templateName = componentTemplate?.value || ''
      const urlName = componentUrl?.value || ''
      const styleNames = componentStyles?.value.split(',') || ''

      if (templateName.length) {
        initTemplate(Alpine, templateName, shadowDom)
      }

      if (urlName.length) {
        initUrl(Alpine, urlName, shadowDom)
      }

      if (styleNames.length) {
        initStyles(shadowDom, styleNames)
      }

      this._hasInit = true
    }
  }

  const { name: componentName } = window?.xComponent || { name: 'x-component' }

  if (window.customElements.get(componentName)) {
    return
  }

  customElements.define(componentName, ComponentWrapper)

  new ComponentWrapper()

  // Register the directive
  Alpine.directive('component', (el, { expression }, { evaluate, evaluateLater, effect }) => {
    // Prevent multiple initializations
    if (el._hasComponentInit) {
      return
    }

    const shadowDom = el.attachShadow({ mode: 'open' })

    // Parse attributes from the element
    const getAttributeValue = (attrName) => {
      // Check for dynamic binding first
      if (el.hasAttribute(`:${attrName}`)) {
        return evaluate(el.getAttribute(`:${attrName}`))
      }
      // Check for static attribute
      if (el.hasAttribute(attrName)) {
        return el.getAttribute(attrName)
      }
      return null
    }

    const templateName = getAttributeValue('template') || ''
    const urlName = getAttributeValue('url') || ''
    const styleNames = getAttributeValue('styles') || ''

    if (templateName.length) {
      initTemplate(Alpine, templateName, shadowDom)
    }

    if (urlName.length) {
      initUrl(Alpine, urlName, shadowDom)
    }

    if (styleNames.length) {
      initStyles(shadowDom, styleNames.split(','))
    }

    el._hasComponentInit = true
  })
}
