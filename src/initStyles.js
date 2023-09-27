export function initStyles(shadowDom) {
  const newStyle = new CSSStyleSheet()
  const documentStyles = [...document.styleSheets].flatMap(({ cssRules }) => [
    ...cssRules,
  ])

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
