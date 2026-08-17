## Code style

Follow these conventions in all new and edited code. They reflect the maintainer's
preferences; prioritise them over "clever" or maximally terse alternatives.

**Naming.** Prefer descriptive two-word names that state the thing's role, not bare
single words or letters: `hostElement` not `el`, `slotTemplateNode` not `t`,
`componentSource` not `src`, `projectedNode` not `n`, `leastRecentlyUsedKey` not
`k`. Booleans are prefixed `is`, `has`, or `uses` and read as a yes/no question:
`usesUrlModifier`, `allowsCrossOrigin`. Single-letter names are not acceptable
even in small scopes, including `.map()` and `.filter()` callbacks.

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
  CI rebuilds and fails the run if the committed output does not match.
- `CLAUDE.md` is a symlink to `AGENTS.md`. Edit `AGENTS.md`; both names read the
  same file.

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
- `pnpm lint:check` — ESLint without `--fix`, which is what CI runs
- `pnpm format` — Prettier over the repo

`pnpm build` runs `pnpm lint` first, so it can rewrite files in `src/` on its way
through. `lint:check` is the one that leaves the tree alone.

`.github/workflows/ci.yml` runs lint, build, the committed-output check, and the
Playwright suite on every push to `main` and every pull request.

`package.json` has a `files` allowlist. Anything outside `dist/`, `src/`, and
`builds/` is not published, so check `pnpm pack --dry-run` after touching packaging.

`.agents/`, `.claude/`, and `skills-lock.json` are gitignored agent tooling, not
tracked project files. They were vendored briefly and removed in `b4d5aba`; invoking a
skill still writes into them locally, but that no longer dirties the tree.

## Releasing

`dist/` must be committed and current before tagging, because that is what publishes.

```shell
npm publish        # prepublishOnly runs pnpm build first
git tag vX.Y.Z && git push origin vX.Y.Z
```

Bumping the version means editing four places, not one: `package.json`, the two unpkg
URLs in `README.md`, and the one in `examples/index.html`. Those URLs pin an exact
version deliberately — the README tells users to do this so they can add SRI — so a
missed bump leaves the docs and the example page pointing at the previous release.

## Testing

```shell
pnpm exec playwright install chromium firefox webkit
pnpm test
```

Tests run in real browsers against `dist/`, not `src/`, so they cover what
consumers install. `pnpm test` rebuilds first.

Playwright on its own does not, which is the fast inner loop and its one trap: a
bare `pnpm exec playwright test` after editing `src/` runs against the previous
build and passes or fails for the wrong reason. Build first, or use `pnpm test`.
CI builds for the same reason before it calls `pnpm exec playwright test`.

```shell
pnpm exec playwright test tests/slots.spec.js                     # one spec file
pnpm exec playwright test tests/slots.spec.js --project=chromium  # one engine
pnpm exec playwright test -g 'projects default and named slot'    # by test title
pnpm exec playwright test --headed --project=chromium             # watch it run
pnpm exec playwright test tests/url.spec.js --debug               # step through
```

Every spec runs on all three engines. Trusted Types is implemented everywhere now,
so `csp.spec.js` and `trusted-types.spec.js` are not pinned to Chromium — if an
assertion only holds on one engine, that is a bug in the assertion. Two already
were: WebKit serializes `oklch()` hues with more precision, and Firefox attributes
its engine deprecation warnings to whatever bundle was on the stack.

`tests/fixtures/index.html` is a single page covering every feature, wired with
`data-testid` hooks and buttons. Add new scenarios to that page rather than creating
more fixture files, and prefer driving the UI (`getByTestId(...).click()`) over
reaching into Alpine internals with `page.evaluate`. Open it by hand with
`pnpm test:serve`.

A scenario only earns a fixture page of its own when it needs a different Alpine build
or a document-level policy that `index.html` cannot carry — `csp.html` and
`trusted-types.html` are the two that do. `index.html` and `csp.html` load
`fixtures/lifecycle-log.js`, so `lifecycleEventsFor()` in `tests/helpers.js` reads the
same log across both. `trusted-types.html` does not, so lifecycle assertions are not
available there.

It is served on ports 3210 and 3211 so cross-origin `.url` behaviour can be tested
against a real second origin. `reuseExistingServer` is on outside CI, so a
`pnpm test:serve` you left running is reused and Playwright skips its own start
command — including the `build:css` inside it. Restart that server after editing
`tests/fixtures/app.css` or the fixture styles stay stale.

Two sections of `index.html` are flagged `Known bug` and specs pin the wrong
behaviour on purpose: a `<slot>` inside `x-for` or `x-if` evaluates in the
component's scope instead of the host's, and a throwing directive expression emits
no `x-component:error`. Both are documented limitations in the README, so fixing
one means changing the fixture, its spec, and the docs together.

## Documentation

- [Alpine.js directives](https://alpinejs.dev/directives/data)
- [Alpine.js plugin authoring](https://alpinejs.dev/advanced/extending)
- [Playwright test API](https://playwright.dev/docs/api/class-test)
