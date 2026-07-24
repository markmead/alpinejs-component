export function resolveSourceValue(sourceExpression, evaluateExpression) {
  if (!sourceExpression) {
    return { value: '', error: null }
  }

  try {
    const evaluatedValue = evaluateExpression(sourceExpression)

    if (typeof evaluatedValue === 'string') {
      return { value: evaluatedValue.trim(), error: null }
    }

    if (evaluatedValue === null || typeof evaluatedValue === 'undefined') {
      return { value: '', error: null }
    }

    return { value: String(evaluatedValue), error: null }
  } catch (evaluationError) {
    console.error(
      `[alpinejs-component] Failed to evaluate expression: ${sourceExpression}`,
      evaluationError,
    )

    return { value: '', error: evaluationError }
  }
}
