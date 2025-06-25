export function initStyles(shadowDom, styleTargets) {
  const useGlobal = styleTargets.includes('global')

  const documentSheets = useGlobal
    ? [...document.styleSheets]
    : [...document.styleSheets].filter(({ title: styleTitle }) =>
        styleTargets.includes(styleTitle)
      )

  const filteredDocumentSheets = documentSheets.filter(
    ({ href: styleHref }) => {
      // We keep inline styles
      if (!styleHref) {
        return true
      }

      // We remove external stylesheets
      return styleHref?.includes(window.location.host)
    }
  )

  const documentStyles = filteredDocumentSheets.flatMap(({ cssRules }) => [
    ...cssRules,
  ])

  const newStyle = new CSSStyleSheet()

  for (const styleRule of documentStyles.reverse()) {
    if (
      styleRule instanceof CSSStyleRule &&
      styleRule.selectorText === ':root'
    ) {
      continue
    }

    newStyle.insertRule(styleRule.cssText)
  }

  shadowDom.adoptedStyleSheets = [newStyle]
}
