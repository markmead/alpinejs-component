import { adoptedStylesheetCache, setBoundedCacheEntry } from './cache'

function shouldIncludeStylesheet(stylesheetHref) {
  if (!stylesheetHref) {
    return true
  }

  try {
    const stylesheetUrl = new URL(stylesheetHref, window.location.href)

    return stylesheetUrl.origin === window.location.origin
  } catch {
    return false
  }
}

function getCssTextFromStylesheet(targetStylesheet) {
  try {
    return [...targetStylesheet.cssRules]
      .filter((stylesheetRule) => {
        if (
          typeof CSSImportRule !== 'undefined' &&
          stylesheetRule instanceof CSSImportRule
        ) {
          return false
        }

        return !(
          stylesheetRule instanceof CSSStyleRule &&
          stylesheetRule.selectorText === ':root'
        )
      })
      .map(({ cssText }) => cssText)
      .join('\n')
  } catch {
    // Accessing cssRules can throw due to CORS-restricted stylesheets.
    return ''
  }
}

export function initStyles(shadowRootNode, styleTargetList) {
  const normalizedStyleTargets = [
    ...new Set(
      styleTargetList.map((styleTarget) => styleTarget.trim()).filter(Boolean),
    ),
  ]

  if (!normalizedStyleTargets.length) {
    return
  }

  const styleCacheKey = normalizedStyleTargets.slice().sort().join(',')

  if (!adoptedStylesheetCache.has(styleCacheKey)) {
    const useGlobalStyles = normalizedStyleTargets.includes('global')

    const documentStyleSheets = useGlobalStyles
      ? [...document.styleSheets]
      : [...document.styleSheets].filter(({ title }) =>
          normalizedStyleTargets.includes(title),
        )

    const combinedCssText = documentStyleSheets
      .filter(({ href }) => shouldIncludeStylesheet(href))
      .map((documentStylesheet) => getCssTextFromStylesheet(documentStylesheet))
      .join('\n')

    const stylesheetInstance = new CSSStyleSheet()

    stylesheetInstance.replaceSync(combinedCssText)

    setBoundedCacheEntry(
      adoptedStylesheetCache,
      styleCacheKey,
      stylesheetInstance,
    )
  }

  shadowRootNode.adoptedStyleSheets = [
    adoptedStylesheetCache.get(styleCacheKey),
  ]
}
