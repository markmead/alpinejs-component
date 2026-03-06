import { adoptedStylesheetCache } from './cache'

function shouldIncludeStylesheet(stylesheetHref) {
  if (!stylesheetHref) {
    return true
  }

  return stylesheetHref.includes(window.location.host)
}

function getCssTextFromStylesheet(targetStylesheet) {
  try {
    return [...targetStylesheet.cssRules]
      .filter((stylesheetRule) => {
        return !(
          stylesheetRule instanceof CSSStyleRule &&
          stylesheetRule.selectorText === ':root'
        )
      })
      .map((stylesheetRule) => stylesheetRule.cssText)
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
      : [...document.styleSheets].filter(({ title: styleTitle }) =>
          normalizedStyleTargets.includes(styleTitle),
        )

    const combinedCssText = documentStyleSheets
      .filter(({ href: stylesheetHref }) =>
        shouldIncludeStylesheet(stylesheetHref),
      )
      .map((documentStylesheet) => getCssTextFromStylesheet(documentStylesheet))
      .join('\n')

    const stylesheetInstance = new CSSStyleSheet()

    stylesheetInstance.replaceSync(combinedCssText)

    adoptedStylesheetCache.set(styleCacheKey, stylesheetInstance)
  }

  shadowRootNode.adoptedStyleSheets = [
    adoptedStylesheetCache.get(styleCacheKey),
  ]
}
