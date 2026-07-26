# The fixture page

`index.html` is the demo **and** the thing Playwright drives. There is no separate demo
site. If you want to show someone what the plugin does, send them here.

Run it by hand:

```shell
pnpm test:serve
# http://localhost:3210/tests/fixtures/index.html
```

`test:serve` compiles the Tailwind build first and disables `cleanUrls`, which matters:
`serve`'s default rewrite drops the filename and resolves relative template URLs a
directory too high.

## Rules for editing this page

**Explain it like the reader has never seen the plugin.** Every section shows the
template, the usage, and the live result together. Nobody should have to scroll or open
an editor to find out what produced a result.

**Keep templates next to the section that uses them.** Not in a block at the bottom.

**Name sections after what you are doing**, not after the bug that made them necessary.
"Load a template from a URL", not "URL mode". Put the regression detail in the body text.

**Show what is broken.** Known bugs get a section with a `Known bug` flag and a live
demonstration of the wrong output, not a footnote. A reader deciding whether to upgrade
needs to see the sharp edges.

**No `@apply`.** `app.css` is Tailwind plus hand-written CSS. Repeated chrome gets a real
CSS class with real declarations. Tailwind utilities stay in the markup, where they also
serve as the proof for issue #41.

**No web fonts.** This page runs inside the test suite. It must not depend on a network
fetch to render.

**Add scenarios here rather than making new fixture files.** A scenario only earns its own
page when it needs a different Alpine build or a document-level policy this page cannot
carry — `csp.html` and `trusted-types.html` are the only two that qualify.

## What the tests depend on

Change these and the suite breaks. Check before you refactor.

| Hook | Used by |
| --- | --- |
| `.card` on rendered component roots | `render`, `light-dom`, `slots` visibility waits |
| `.styled` with `p-4`, `bg-slate-50`, `text-proof` | `light-dom` asserts exact computed padding, background, colour |
| `.remote` from `remote-card.html` | `lifecycle`, `url` visibility waits |
| `.dupe`, `.cell` | `slots` |
| `h3` + `li` inside `basic` | `render` |
| `h2` inside `lifecycle`, `external`, `retry` | `url` |
| `strong` first/last inside `proof` | `light-dom` reads `$refs` then `$root` |
| `#proof-input`, label text "A label outside the component" | `light-dom` |
| `dynamic` having exactly one child element | `render` |
| `slot` and `[data-testid] > template[x-slot]` both at count 0 | `slots` |

Roughly thirty `data-testid` hooks are wired to specs. Grep before renaming one.

`--color-proof` is a fixed hex in `app.css` on purpose, so the light-DOM styling test can
assert an exact `rgb(0, 128, 0)` rather than a Tailwind palette value that may shift
between releases.
