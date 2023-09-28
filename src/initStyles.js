export function initStyles(shadowDom, styleTargets) {
  const useGlobal = styleTargets.includes('global')

  const documentSheets = useGlobal
    ? [...document.styleSheets]
    : [...document.styleSheets].filter(({ title: styleTitle }) =>
        styleTargets.includes(styleTitle)
      )
  const documentStyles = documentSheets.flatMap(({ cssRules }) => [...cssRules])

  const newStyle = new CSSStyleSheet()

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
