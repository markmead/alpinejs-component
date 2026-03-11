import {
  remoteTemplateCache,
  setBoundedCacheEntry,
  templateFragmentCache,
} from './cache'

function htmlToFragment(htmlString) {
  const templateElement = document.createElement('template')

  templateElement.innerHTML = htmlString

  return templateElement.content
}

export function loadFromTemplate(templateIdentifier) {
  const normalizedTemplateId = (templateIdentifier || '').trim()

  if (!normalizedTemplateId.length) {
    return null
  }

  if (!templateFragmentCache.has(normalizedTemplateId)) {
    const templateElementNode = document.getElementById(normalizedTemplateId)

    if (!templateElementNode) {
      console.warn(
        `[alpinejs-component] Missing template: "${normalizedTemplateId}"`,
      )

      return null
    }

    setBoundedCacheEntry(
      templateFragmentCache,
      normalizedTemplateId,
      htmlToFragment(templateElementNode.innerHTML),
    )
  }

  return templateFragmentCache.get(normalizedTemplateId).cloneNode(true)
}

export async function loadFromUrl(urlIdentifier) {
  const normalizedUrl = (urlIdentifier || '').trim()

  if (!normalizedUrl.length) {
    return null
  }

  if (!remoteTemplateCache.has(normalizedUrl)) {
    setBoundedCacheEntry(
      remoteTemplateCache,
      normalizedUrl,
      fetch(normalizedUrl).then((fetchResponse) => {
        if (!fetchResponse.ok) {
          throw new Error(
            `Request failed (${fetchResponse.status}) for ${normalizedUrl}`,
          )
        }

        return fetchResponse.text()
      }),
    )
  }

  try {
    const templateMarkup = await remoteTemplateCache.get(normalizedUrl)

    return htmlToFragment(templateMarkup).cloneNode(true)
  } catch (fetchError) {
    remoteTemplateCache.delete(normalizedUrl)

    throw fetchError
  }
}
