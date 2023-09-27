export async function initTemplate(Alpine, templateName, shadowDom) {
  function generateComponent(targetHtml) {
    const htmlTemplate = document.getElementById(targetHtml)
    const newComponent = new DOMParser().parseFromString(
      htmlTemplate.innerHTML,
      'text/html'
    ).body.firstChild

    return Promise.resolve(newComponent)
  }

  const alpineComponent = await generateComponent(templateName)

  shadowDom.appendChild(alpineComponent)

  Alpine.initTree(shadowDom)
}

export async function initUrl(Alpine, urlName, shadowDom) {
  const htmlResponse = await fetch(urlName)
  const htmlTemplate = await htmlResponse.text()

  const newComponent = new DOMParser().parseFromString(
    htmlTemplate,
    'text/html'
  ).body.firstChild

  shadowDom.appendChild(newComponent)

  Alpine.initTree(shadowDom)
}
