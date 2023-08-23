export default function (Alpine) {
  class ComponentWrapper extends HTMLElement {
    connectedCallback() {
      const shadowDom = this.attachShadow({ mode: 'open' })

      const hasDynamicTemplate = this.hasAttribute(':template')
      const hasDynamicUrl = this.hasAttribute(':url')

      if (hasDynamicTemplate || hasDynamicUrl) {
        Alpine.initTree(this)
      }

      const { template: componentTemplate, url: componentUrl } = this.attributes

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

  if (window.customElements.get('x-component-wrapper')) {
    return
  }

  customElements.define('x-component-wrapper', ComponentWrapper)

  Alpine.directive('component', () => new ComponentWrapper())
}
