export async function initTemplate(componentWrapper, Alpine, templateName, shadowDom) {
  function generateComponent(targetHtml) {
    const htmlTemplate = document.getElementById(targetHtml)

    const domParser = new DOMParser()

    const newComponent = domParser.parseFromString(
      htmlTemplate.innerHTML,
      'text/html'
    ).body.firstChild

    return Promise.resolve(newComponent)
  }

  const alpineComponent = await generateComponent(templateName)
  shadowDom.appendChild(alpineComponent)

  initSlots(componentWrapper, shadowDom)

  Alpine.initTree(shadowDom)
}

export async function initUrl(componentWrapper, Alpine, urlName, shadowDom) {
  const htmlResponse = await fetch(urlName)
  const htmlTemplate = await htmlResponse.text()

  const domParser = new DOMParser()

  const newComponent = domParser.parseFromString(htmlTemplate, 'text/html').body.firstChild
  shadowDom.appendChild(newComponent)

  Alpine.initTree(shadowDom)
}
