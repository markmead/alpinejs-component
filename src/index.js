export default function (Alpine) {
  class ComponentWrapper extends HTMLElement {
    connectedCallback() {
      const shadow = this.attachShadow({ mode: 'open' })

      if (this.hasAttribute(':template') || this.hasAttribute(':url')) {
        Alpine.initTree(this)
      }

      if (this.attributes.template) {
        const template = document.getElementById(this.attributes.template.value)
        const component = new DOMParser().parseFromString(
          template.innerHTML,
          'text/html'
        ).body.firstChild

        shadow.appendChild(component)

        document.addEventListener('alpine:initialized', () => {
          Alpine.initTree(shadow)
        })
      }

      if (this.attributes.url) {
        fetch(this.attributes.url.value)
          .then((response) => response.text())
          .then((template) => {
            const component = new DOMParser().parseFromString(
              template,
              'text/html'
            ).body.firstChild

            shadow.appendChild(component)

            Alpine.initTree(shadow)
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
