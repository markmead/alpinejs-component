// Fills the Template and Usage panels from the page itself, so a snippet can never drift from
// what it claims to show. Runs before Alpine starts, because x-component rewrites the elements
// it renders into: once a component has mounted, the usage markup on the page is the output.

function formatMarkup(markup) {
  const [openingLine, ...remainingLines] = markup.split('\n')

  const indentWidths = remainingLines
    .filter((markupLine) => markupLine.trim().length)
    .map((markupLine) => markupLine.length - markupLine.trimStart().length)

  const sharedIndent = Math.min(...indentWidths)

  return [openingLine, ...remainingLines.map((markupLine) => markupLine.slice(sharedIndent))]
    .join('\n')
    .trimEnd()
}

function findSourceElements(sourceBlock) {
  const sourceSelector = sourceBlock.dataset.source

  if (sourceSelector === 'usage') {
    return [...sourceBlock.closest('section').querySelectorAll('[data-result] > *')]
  }

  return [...document.querySelectorAll(sourceSelector)]
}

for (const sourceBlock of document.querySelectorAll('[data-source]')) {
  sourceBlock.textContent = findSourceElements(sourceBlock)
    .map((sourceElement) => formatMarkup(sourceElement.outerHTML))
    .join('\n\n')
}

for (const remoteBlock of document.querySelectorAll('[data-source-url]')) {
  fetch(remoteBlock.dataset.sourceUrl)
    .then((remoteResponse) => remoteResponse.text())
    .then((remoteMarkup) => {
      remoteBlock.textContent = remoteMarkup.trim()
    })
}
