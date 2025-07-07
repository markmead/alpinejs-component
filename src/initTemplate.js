function initSlots(componentWrapper, shadowDom) {
  if (!componentWrapper.textContent) {
    return
  }

  const fragments = {
    default: document.createDocumentFragment(),
    named: {}
  }

  // Collect elements for named slots
  const namedSlottables = componentWrapper.querySelectorAll('& > [slot]')
  for (const slottable of namedSlottables) {
    if (!(slottable.slot in fragments.named)) {
      fragments.named[slottable.slot] = document.createDocumentFragment()
    }

    const fragment = fragments.named[slottable.slot]
    fragment.append(slottable)
  }

  // Collect elements for default slot
  const defaultSlottables = componentWrapper.querySelectorAll('& > :not([slot])')
  for (const slottable of defaultSlottables) {
    fragments.default.append(slottable)
  }
  
  // Transfer elements to named slots
  for (const name in fragments.named) {
    const slot = shadowDom.querySelector(`slot[name="${name}"]`)
    const fragment = fragments.named[name]

    if (slot !== null) {
      slot.replaceWith(fragment)
    }
  }

  // Transfer elements to default slot
  const defaultSlot = shadowDom.querySelector('slot:not([name])')
  if (defaultSlot !== null) {
    defaultSlot.replaceWith(fragments.default)
  }
}

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
  
  initSlots(componentWrapper, shadowDom)

  Alpine.initTree(shadowDom)
}
