## Code style

Follow these conventions in all new and edited code. They reflect the maintainer's
preferences; prioritise them over "clever" or maximally terse alternatives.

**Naming.** Prefer descriptive two-word names that state the thing's role, not bare
single words or letters: `hostElement` not `el`, `slotTemplateNode` not `t`,
`componentSource` not `src`, `projectedNode` not `n`, `stylesheetRule` not `r`.
Booleans are prefixed `is`, `has`, or `uses` and read as a yes/no question:
`hasMountedTree`, `usesUrlModifier`, `isReady`. Single-letter names are not
acceptable even in small scopes, including `.map()` and `.filter()` callbacks.

**Functions.** Prefer named `function foo() {}` declarations over
`const foo = () => {}`. Arrow functions are only for true inline callbacks
(`.map(...)`, `.filter(...)`, event listeners passed inline).

**Decomposition.** Keep modules focused. `src/` is split by responsibility —
directive wiring, template loading, caching — and new concerns should get their own
module rather than growing `src/index.js`. Near-duplicate blocks become one helper,
not copy-paste.

**Spacing.** Separate logical steps with blank lines, and always put a blank line
before a `return` that follows other statements. Dense, unbroken blocks are harder
to scan than slightly longer ones.

**Comments.** Keep code near-comment-free; let names and structure carry meaning.
Add a brief comment only for genuinely surprising behaviour or a non-obvious "why" —
for example, why DOM writes are wrapped in `Alpine.mutateDom`, or why slot content
gets the host's scope. Never narrate what the next line does.

**Formatting.** Prettier owns formatting: no semicolons, single quotes, trailing
commas, 100 columns (80 for Markdown). Run `pnpm format` rather than hand-aligning.

## Architecture

- `src/index.js` — directive wiring only: reads the expression, decides what to
  render, delegates the rest.
- `src/source.js` — turning a directive expression into a source string.
- `src/template.js` — resolving and loading templates from the page or a URL.
- `src/slots.js` — capturing `x-slot` templates and projecting them into `<slot>`.
- `src/render.js` — mounting and unmounting a component into its host.
- `src/events.js` — lifecycle event dispatch and render error reporting.
- `src/cache.js` — bounded caches shared by the loaders.
- `builds/` — the two entry points esbuild consumes.
- `dist/` — **committed to the repo** and published. Rebuild with `pnpm build`
  whenever `src/` or `builds/` changes, and include the result in the same commit.

Content renders into the light DOM. There is no Shadow DOM, and `<slot>` is resolved
by manual projection rather than natively — see the slot handling in `src/slots.js`
before changing anything in that area.

## Development

Use pnpm. There is no npm lockfile.

```shell
pnpm install
pnpm build
```

- `pnpm build` — lint, then build minified CDN and ESM outputs into `dist/`
- `pnpm lint` — ESLint with `--fix`
- `pnpm format` — Prettier over the repo

`package.json` has a `files` allowlist. Anything outside `dist/`, `src/`, and
`builds/` is not published, so check `pnpm pack --dry-run` after touching packaging.

## Testing

```shell
pnpm exec playwright install chromium
pnpm test
```

Tests run in a real browser against `dist/`, not `src/`, so they cover what
consumers install. `pnpm test` rebuilds first.

`tests/fixtures/index.html` is a single page covering every feature, wired with
`data-testid` hooks and buttons. Add new scenarios to that page rather than creating
more fixture files, and prefer driving the UI (`getByTestId(...).click()`) over
reaching into Alpine internals with `page.evaluate`. Open it by hand with
`pnpm test:serve`.

It is served on ports 3210 and 3211 so cross-origin `.url` behaviour can be tested
against a real second origin.

## Documentation

- [Alpine.js directives](https://alpinejs.dev/directives/data)
- [Alpine.js plugin authoring](https://alpinejs.dev/advanced/extending)
- [Playwright test API](https://playwright.dev/docs/api/class-test)
