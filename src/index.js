export default function (Alpine) {
  class ComponentWrapper extends HTMLElement {
    connectedCallback() {
      const shadowDom = this.attachShadow({ mode: 'open' })

      const hasDynamicTemplate = this.hasAttribute(':template')
      const hasDynamicUrl = this.hasAttribute(':url')
      const hasDynamicStyles = this.hasAttribute(':styles')

      if (hasDynamicTemplate || hasDynamicUrl || hasDynamicStyles) {
        Alpine.initTree(this)
      }

      const { template: componentTemplate, url: componentUrl, styles: componentStyles } = this.attributes

      if (componentStyles) {
        const styles = new CSSStyleSheet()
        styles.insertRule(':host { display: contents; }')
        let i = 0
        for (const rule of [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules])) {
          if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
            continue
          }
          styles.insertRule(rule.cssText, i++)
        }
        shadowDom.adoptedStyleSheets = [styles]
      }

      if (componentTemplate) {
        function generateComponent(targetHtml) {
          const htmlTemplate = document.getElementById(targetHtml)
          const newComponent = new DOMParser().parseFromString(
            htmlTemplate.innerHTML,
            'text/html'
          ).body.firstChild

          return Promise.resolve(newComponent)
        }

        generateComponent(componentTemplate.value).then((alpineComponent) => {
          shadowDom.appendChild(alpineComponent)

          Alpine.initTree(shadowDom)
        })
      }

      if (componentUrl) {
        fetch(componentUrl.value)
          .then((htmlResponse) => htmlResponse.text())
          .then((htmlTemplate) => {
            const newComponent = new DOMParser().parseFromString(
              htmlTemplate,
              'text/html'
            ).body.firstChild

            shadowDom.appendChild(newComponent)

            Alpine.initTree(shadowDom)
          })
      }
    }
  }

  if (window.customElements.get('x-component')) {
    return
  }

  customElements.define('x-component', ComponentWrapper)

  new ComponentWrapper()
}
