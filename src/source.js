export function resolveSourceValue(sourceExpression, evaluateExpression) {
  if (!sourceExpression) {
    return ''
  }

  const evaluatedValue = evaluateExpression(sourceExpression)

  if (typeof evaluatedValue === 'string') {
    return evaluatedValue.trim()
  }

  if (evaluatedValue === null || typeof evaluatedValue === 'undefined') {
    return ''
  }

  return String(evaluatedValue)
}
