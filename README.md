# Alpine JS Component

![](https://img.shields.io/npm/v/alpinejs-component)
![](https://img.shields.io/npm/dt/alpinejs-component)
![](https://img.shields.io/github/license/markmead/alpinejs-component)

Directive-based Alpine.js components with slots and cached template rendering.

**[✨ View the demos on CodePen](https://codepen.io/editor/markmead/pen/019d86f8-ed3f-7342-b0c1-b890dec04c9c?file=%2Findex.html&orientation=left&show=preview)**

## V3 Overview

v3 is directive-based and built around `x-component`.

- No custom element registration required
- Supports on-page templates and remote templates
- Renders into the light DOM, so your page's CSS applies as-is
- Supports default and named slots from host templates
- Emits lifecycle events for loading, loaded, and error states
- Uses bounded caches for templates and remote responses

## Install

### With a CDN

```html
<script
  defer
  src="https://unpkg.com/alpinejs-component@3.0.0/dist/component.min.js"
></script>

<script defer src="https://unpkg.com/alpinejs@3.15.12/dist/cdn.min.js"></script>
```

Pin an exact version rather than using `@latest`. A pinned URL is immutable, so you
can add Subresource Integrity and know the file can't change under you:

```html
<script
  defer
  src="https://unpkg.com/alpinejs-component@3.0.0/dist/component.min.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

Don't use `integrity` with a floating tag like `@latest` or `@3` — the file changes
and the hash stops matching, which blocks the script entirely.

### With a Package Manager

```shell
npm install alpinejs-component
yarn add alpinejs-component
pnpm add alpinejs-component
```

```js
import Alpine from 'alpinejs'
import component from 'alpinejs-component'

Alpine.plugin(component)
Alpine.start()
```

## Usage

v3 uses an Alpine directive: `x-component`.

## Directive Reference

- `x-component="expression"`: render from an on-page `<template id="...">`
- `x-component.url="expression"`: render from a URL
- `x-component.url.external="expression"`: allow cross-origin `http(s)` URLs

The directive expression can be static or dynamic. Values are normalized as:

- `string`: trimmed and used directly
- `number` / `boolean` / other primitives: converted with `String(...)`
- `null` / `undefined` / empty string: treated as empty source

When the resolved source is empty, the mounted component is unmounted/cleared.

### Render From an On-Page Template

```html
<div
  x-data="{
    people: [
      { name: 'John', age: '25', skills: ['JavaScript', 'CSS'] },
      { name: 'Jane', age: '30', skills: ['Laravel', 'MySQL', 'jQuery'] }
    ]
  }"
>
  <ul>
    <template x-for="person in people" :key="person.name">
      <li>
        <div x-data="{ item: person }" x-component="'person-card'"></div>
      </li>
    </template>
  </ul>
</div>

<template id="person-card">
  <article>
    <h2 x-text="item.name"></h2>
    <p x-text="item.age"></p>

    <ul>
      <template x-for="skill in item.skills" :key="skill">
        <li x-text="skill"></li>
      </template>
    </ul>
  </article>
</template>
```

### Render From a URL

Use the `.url` modifier when the expression resolves to a URL.

By default, `.url` only allows `http(s)` URLs on the current origin. Add the
`.external` modifier to allow cross-origin `http(s)` URLs.

```html
<div
  x-data="{
    people: [
      { name: 'John', age: '25', skills: ['JavaScript', 'CSS'] },
      { name: 'Jane', age: '30', skills: ['Laravel', 'MySQL', 'jQuery'] }
    ]
  }"
>
  <ul>
    <template x-for="person in people" :key="person.name">
      <li>
        <div
          x-data="{ item: person }"
          x-component.url="'/public/person-card.html'"
        ></div>
      </li>
    </template>
  </ul>
</div>
```

### Dynamic Template Values

`x-component` and `x-component.url` support dynamic expressions.

```html
<div
  x-data="{
    view: 'person-card',
    remoteView: '/public/person-card.html'
  }"
>
  <section x-component="view"></section>
  <section x-component.url="remoteView"></section>
</div>
```

## Styles

Rendered content is mounted in the light DOM, so your stylesheets apply to it
with no extra setup. Style components the same way you style the rest of the
page.

```html
<style>
  .person-card {
    border: 1px solid #ddd;
  }
</style>

<div x-component="'person-card'"></div>
```

If you want styles scoped to one component, reach for `@scope` or a class
convention rather than the plugin:

```html
<style>
  @scope (.person-card) {
    h2 {
      font-size: 1.25rem;
    }
  }
</style>
```

## Slots

Slot templates can be declared on the host element with `x-slot`.

Each `<slot>` in the component is replaced with the matching `x-slot` content.
A `<slot>` with no matching content keeps its own children as fallback.

Slot content is authored on the host, so it evaluates against the host's Alpine
scope, not the scope of the component it is rendered into.

```html
<div x-component="'card-with-slot'">
  <template x-slot>
    <p>Default slot content</p>
  </template>

  <template x-slot="actions">
    <button>Save</button>
  </template>
</div>

<template id="card-with-slot">
  <article>
    <slot></slot>
    <footer>
      <slot name="actions"></slot>
    </footer>
  </article>
</template>
```

### Slots inside `x-for` and `x-if`

A `<slot>` nested in an `x-for` or `x-if` template is filled, and its content is
repeated for every iteration.

It is the one place where slot content does **not** evaluate against the host's
scope. Alpine clones those templates at render time, and the marker that binds
projected content to the host does not survive the clone, so the content sees the
surrounding component scope instead:

```html
<div x-data="{ label: 'host' }">
  <div x-component="'row-list'">
    <template x-slot="cell">
      <!-- Renders "component", not "host". -->
      <span x-text="label"></span>
    </template>
  </div>
</div>

<template id="row-list">
  <ul x-data="{ label: 'component', rows: [1, 2] }">
    <template x-for="row in rows">
      <li><slot name="cell"></slot></li>
    </template>
  </ul>
</template>
```

Keep slots out of `x-for` and `x-if` if you need host scope inside them.

## Lifecycle Events

The host element emits lifecycle events:

- `x-component:loading` when URL loading starts
- `x-component:loaded` when render completes
- `x-component:error` when loading or rendering fails

Event detail payloads:

- `x-component:loading`: `{ source }`
- `x-component:loaded`: `{ source }`
- `x-component:error`: `{ source, error }`

`source` is the resolved template id/URL.

Attach listeners to an ancestor rather than the host element itself.
`x-component:loading` is dispatched while the host's own directives are still
being processed, so an `x-on` binding on the host can miss it. The events
bubble, so an ancestor always sees them.

If the directive expression itself throws, Alpine reports the error through its
own handler and the component source is treated as empty, so any mounted
content is cleared. No `x-component:error` is emitted in that case.

```html
<div
  x-component.url="'/public/person-card.html'"
  x-on:x-component:loaded="console.log('component ready', $event.detail)"
  x-on:x-component:error="console.error('component failed', $event.detail)"
></div>
```

## Security

**Important:** Only load templates from trusted sources. This plugin:

- Renders HTML content directly (no sanitization)
- Performs minimal URL validation (only `http(s)` and same-origin by default)
- Is designed for developer-controlled content

**Your responsibility:**

- Don't use user input directly in `x-component` or `x-component.url`
- Only load templates from your own trusted servers
- Validate/sanitize any dynamic template selection
- Use CSP headers for additional protection
- `x-component.url` accepts only `http(s)` URLs
- `x-component.url` blocks cross-origin requests by default
- Use `x-component.url.external` to opt into cross-origin `http(s)` requests

### Content Security Policy

**Alpine's default build needs `'unsafe-eval'`.** It compiles every directive
expression with `new Function`, so this is about Alpine itself, not just this plugin.
If your CSP can't allow `'unsafe-eval'`, use Alpine's
[CSP build](https://alpinejs.dev/advanced/csp) (`@alpinejs/csp`). This plugin works
with it — `x-component`, `.url`, slots, and dynamic expressions all behave the same.

**Trusted Types needs both pieces.** Templates are parsed by assigning to
`innerHTML`, which is a Trusted Types sink, so under
`require-trusted-types-for 'script'` the plugin registers a pass-through policy named
`alpinejs-component`. Allow that name:

```http
Content-Security-Policy: trusted-types alpinejs-component; require-trusted-types-for 'script'
```

If the name isn't allowed, the plugin logs a warning and rendering fails on that page.

That header alone is not enough, though. `require-trusted-types-for 'script'` also
blocks `new Function`, so Alpine's default build can't evaluate any expression and
nothing renders at all. Trusted Types therefore requires the CSP build **and** the
policy name above. That combination is what's verified to work.

The policy does **not** sanitize; it exists so the plugin works under enforcement,
not to make untrusted templates safe — the trust model above still applies.
Sanitizing here isn't an option: `setHTML()` and the Sanitizer API strip unknown
attributes, which removes `x-text`, `x-for`, `@click`, and every other Alpine
directive, leaving inert markup.

## Browser Support

This plugin targets modern browsers with support for:

- `template.content`
- `Element.replaceChildren`

The suite runs against Chromium, Firefox and WebKit on every change, so that
support is tested rather than assumed.

## Caching

The plugin maintains bounded in-memory caches:

- Template fragments by template id (limit: 200)
- Remote template fetch promises by normalized URL (limit: 200)

When a cache exceeds its limit, oldest entries are evicted.

For URL mode, failed fetches are removed from cache so retries can succeed.

## Development

Working on the plugin needs pnpm. The published package installs fine with npm
or yarn, but this repo has no npm lockfile, and `npm install` would add one that
drifts from `pnpm-lock.yaml`.

```shell
pnpm install
pnpm build
```

Available scripts:

- `pnpm build`: lint then build minified CDN + ESM outputs in `dist/`
- `pnpm lint`: run ESLint with `--fix`
- `pnpm lint:check`: run ESLint without fixing, which is what CI runs
- `pnpm format`: run Prettier over the repo
- `pnpm test`: run the Playwright suite against `dist/`
- `pnpm test:ui`: run the suite in Playwright's UI mode
- `pnpm test:serve`: serve the repo so you can open the fixture by hand

`dist/` is committed, so rebuild with `pnpm build` and include the result in the
same commit whenever `src/` or `builds/` changes. CI rebuilds and fails if the
committed output differs from what the source produces.

## Testing

Tests run in real browsers with Playwright, against the built `dist/` output
rather than `src/`, so they cover what consumers actually install. The suite runs
on Chromium, Firefox and WebKit, and CI runs all three.

```shell
pnpm exec playwright install chromium firefox webkit
pnpm test
```

`tests/fixtures/index.html` is a single page exercising every feature, wired up
with `data-testid` hooks and buttons. The specs drive it, and you can open it
yourself:

```shell
pnpm test:serve
# then visit http://localhost:3210/tests/fixtures/index.html
```

The page is served on ports 3210 and 3211 so the cross-origin `.url` behaviour
is testable against a real second origin.

Two scenarios cannot share that page, because they need a different Alpine build
and a policy the page itself cannot carry: `csp.html` covers the `@alpinejs/csp`
build under an enforced `script-src 'self'`, and `trusted-types.html` covers
`require-trusted-types-for 'script'`.

## Notes

- Missing templates and failed URL requests are handled with console
  warnings/errors and lifecycle error events.
- A throwing directive expression is reported by Alpine's own error handler, not
  as `x-component:error`. The host's mounted content is cleared.
- URL responses are cached by URL.
- Template fragments are cached by template id.

## Migration From v2

v3 renders into the light DOM instead of a Shadow DOM root.

Remove `x-component-styles` and `styles`. They no longer exist, because document
styles now reach component content on their own.

```html
<!-- v2 -->
<div x-component="'person-card'" x-component-styles="person-card"></div>

<!-- v3 -->
<div x-component="'person-card'"></div>
```

If you relied on Shadow DOM to keep page styles _out_ of a component, scope your
CSS with `@scope` or a class convention instead.

Everything else carries over. Templates, `.url`, `.external`, `x-slot`, and the
lifecycle events are unchanged.

What you gain by dropping the shadow boundary:

- Page styles apply to component content with no configuration
- `$refs` and `$root` resolve across the host boundary
- `label[for]`, `aria-describedby`, and friends can reference component content
- Form controls inside a component submit with an ancestor `<form>`
- `document.querySelector` finds component content

## Migration From v1

v1:

```html
<x-component template="person"></x-component>
<x-component url="/public/person.html"></x-component>
```

v2 and v3:

```html
<div x-component="'person'"></div>
<div x-component.url="'/public/person.html'"></div>
```

`window.xComponent.name` custom-element renaming is no longer used because v2
and v3 are directive-based.
