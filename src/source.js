export function resolveSourceValue(sourceExpression, evaluateExpression) {
  if (!sourceExpression) {
    return ''
  }

  const evaluatedValue = evaluateExpression(sourceExpression)

  if (evaluatedValue === null || typeof evaluatedValue === 'undefined') {
    return ''
  }

  return String(evaluatedValue).trim()
}
