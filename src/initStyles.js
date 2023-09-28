export function initStyles(shadowDom, styleTargets) {
  if (!styleTargets.length) {
    return
  }

  const newStyle = new CSSStyleSheet()

  let documentSheets = [...document.styleSheets]

  if (styleTargets.length) {
    const useGlobal = styleTargets.includes('global')

    documentSheets = useGlobal
      ? documentSheets
      : documentSheets.filter(({ title }) => styleTargets.includes(title))
  }

  const documentStyles = documentSheets.flatMap(({ cssRules }) => [...cssRules])

  for (const styleRule of documentStyles) {
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
