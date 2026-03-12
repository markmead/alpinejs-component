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

function resolveTemplateUrl(urlIdentifier, { allowCrossOrigin = false } = {}) {
  const normalizedUrl = (urlIdentifier || '').trim()

  if (!normalizedUrl.length) {
    return ''
  }

  let resolvedUrl

  try {
    resolvedUrl = new URL(normalizedUrl, window.location.href)
  } catch {
    throw new Error(`Invalid URL for x-component.url: ${normalizedUrl}`)
  }

  if (!['http:', 'https:'].includes(resolvedUrl.protocol)) {
    throw new Error(
      `Unsupported URL protocol for x-component.url: ${resolvedUrl.protocol}`,
    )
  }

  if (!allowCrossOrigin && resolvedUrl.origin !== window.location.origin) {
    throw new Error(
      `Cross-origin URL blocked for x-component.url: ${resolvedUrl.href}`,
    )
  }

  return resolvedUrl.href
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

export async function loadFromUrl(urlIdentifier, urlOptions = {}) {
  const normalizedUrl = resolveTemplateUrl(urlIdentifier, urlOptions)

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
