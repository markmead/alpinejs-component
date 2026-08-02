import { remoteFragmentPromiseCache, templateFragmentCache } from './cache'

// Without a policy, every render throws on pages that enforce
// `require-trusted-types-for 'script'`. Markup passes through unchanged, because templates are
// trusted by contract and sanitising here would strip the Alpine directives that make them work.
function createMarkupPolicy() {
  if (!globalThis.trustedTypes?.createPolicy) {
    return null
  }

  try {
    return globalThis.trustedTypes.createPolicy('alpinejs-component', {
      createHTML: (markupString) => markupString,
    })
  } catch (policyError) {
    console.warn(
      '[alpinejs-component] Could not create a Trusted Types policy. Add "alpinejs-component" to the trusted-types CSP directive.',
      policyError,
    )

    return null
  }
}

const markupPolicy = createMarkupPolicy()

function htmlToFragment(htmlString) {
  const templateElement = document.createElement('template')

  templateElement.innerHTML = markupPolicy ? markupPolicy.createHTML(htmlString) : htmlString

  return templateElement.content
}

function resolveTemplateUrl(urlIdentifier, { allowCrossOrigin = false } = {}) {
  const normalizedUrl = (urlIdentifier || '').trim()

  if (!normalizedUrl.length) {
    return ''
  }

  let resolvedUrl

  try {
    resolvedUrl = new URL(normalizedUrl, globalThis.location.href)
  } catch {
    throw new Error(`Invalid URL for x-component.url: ${normalizedUrl}`)
  }

  if (!['http:', 'https:'].includes(resolvedUrl.protocol)) {
    throw new Error(`Unsupported URL protocol for x-component.url: ${resolvedUrl.protocol}`)
  }

  if (!allowCrossOrigin && resolvedUrl.origin !== globalThis.location.origin) {
    throw new Error(`Cross-origin URL blocked for x-component.url: ${resolvedUrl.href}`)
  }

  return resolvedUrl.href
}

export function loadFromTemplate(templateIdentifier) {
  const normalizedTemplateId = (templateIdentifier || '').trim()

  if (!normalizedTemplateId.length) {
    return null
  }

  const cachedFragment = templateFragmentCache.readEntry(normalizedTemplateId)

  if (cachedFragment) {
    return cachedFragment.cloneNode(true)
  }

  const templateElementNode = document.getElementById(normalizedTemplateId)

  if (!templateElementNode) {
    console.warn(`[alpinejs-component] Missing template: "${normalizedTemplateId}"`)

    return null
  }

  const templateFragment = htmlToFragment(templateElementNode.innerHTML)

  templateFragmentCache.writeEntry(normalizedTemplateId, templateFragment)

  return templateFragment.cloneNode(true)
}

function fetchTemplateFragment(normalizedUrl) {
  return fetch(normalizedUrl).then(async (fetchResponse) => {
    if (!fetchResponse.ok) {
      throw new Error(`Request failed (${fetchResponse.status}) for ${normalizedUrl}`)
    }

    return htmlToFragment(await fetchResponse.text())
  })
}

export async function loadFromUrl(urlIdentifier, urlOptions = {}) {
  const normalizedUrl = resolveTemplateUrl(urlIdentifier, urlOptions)

  if (!normalizedUrl.length) {
    return null
  }

  let fragmentPromise = remoteFragmentPromiseCache.readEntry(normalizedUrl)

  if (!fragmentPromise) {
    // The promise rather than its result is cached, so renders that overlap an in-flight
    // request share it instead of each firing their own.
    fragmentPromise = fetchTemplateFragment(normalizedUrl)

    remoteFragmentPromiseCache.writeEntry(normalizedUrl, fragmentPromise)
  }

  try {
    const templateFragment = await fragmentPromise

    return templateFragment.cloneNode(true)
  } catch (fetchError) {
    // Every render awaiting this promise reaches here, so only the promise that actually
    // failed is evicted. A later render may already have replaced it with a fresh one.
    if (remoteFragmentPromiseCache.peekEntry(normalizedUrl) === fragmentPromise) {
      remoteFragmentPromiseCache.dropEntry(normalizedUrl)
    }

    throw fetchError
  }
}
