export default function (Alpine) {
  class ComponentWrapper extends HTMLElement {
    connectedCallback() {
      let shadow = this.attachShadow({ mode: "open" });

      if (this.attributes.template) {
        let template = document.getElementById(this.attributes.template.value);
        let component = new DOMParser().parseFromString(
          template.innerHTML,
          "text/html"
        ).body.firstChild;

        shadow.appendChild(component);

        document.addEventListener("alpine:initialized", () =>
          Alpine.initTree(shadow)
        );
      }

      if (this.attributes.url) {
        fetch(this.attributes.url.value)
          .then((response) => response.text())
          .then((template) => {
            let component = new DOMParser().parseFromString(
              template,
              "text/html"
            ).body.firstChild;

            shadow.appendChild(component);

            Alpine.initTree(shadow);
          });
      }
    }
  }

  if (window.customElements.get("x-component-wrapper")) return;

  customElements.define("x-component-wrapper", ComponentWrapper);

  Alpine.directive("component", () => {
    new ComponentWrapper();
  });
}
