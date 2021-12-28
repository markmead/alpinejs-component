export default function (Alpine) {
  Alpine.directive("component", (el, { modifiers }, { evaluate, effect }) => {
    let target = modifiers[0];
    let file = modifiers[1];
    let name = `x-component.${modifiers.join(".")}`;
    let expressions = el.getAttribute(name).split(",");
    let html = "";

    let finder = (exp) => new RegExp(`{${exp}}`, "g");

    if (file) {
      fetch(`/public/${target}.html`)
        .then((response) => response.text())
        .then((text) => {
          localStorage.setItem(`x-component-${target}`, text);
        });

      html = localStorage.getItem(`x-component-${target}`);
    }

    if (!file) {
      let component = document.getElementById(target);

      html = component.innerHTML;
    }

    effect(() => {
      expressions.forEach((exp) => {
        let value = evaluate(exp);
        let regex = finder(exp);

        html = html.replace(regex, value);
      });

      let element = new DOMParser().parseFromString(html, "text/html").body
        .firstChild;

      el.parentElement.appendChild(element);
    });
  });
}
