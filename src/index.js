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
        template: componentTemplate,
        url: componentUrl,
        styles: componentStyles,
      } = this.attributes

      if (componentStyles) {
        const newStyle = new CSSStyleSheet()
        const documentStyles = [...document.styleSheets].flatMap(
          ({ cssRules }) => [...cssRules]
        )

        for (const styleRule of documentStyles) {
          if (
            styleRule instanceof CSSStyleRule &&
            styleRule.selectorText === ':root'
          ) {
            continue
          }

          newStyle.insertRule(styleRule.cssText)
        }

        shadowDom.adoptedStyleSheets = [newStyle]
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
