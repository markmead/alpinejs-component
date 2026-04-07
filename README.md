# Alpine JS Component

![](https://img.shields.io/npm/v/alpinejs-component)
![](https://img.shields.io/npm/dt/alpinejs-component)
![](https://img.shields.io/github/license/markmead/alpinejs-component)

Directive-based Alpine.js components with Shadow DOM encapsulation, slots, and
cached template rendering.

✨ Demos: <https://alpinejs-component-demo.mm-dev.workers.dev/>.

## V2 Overview

v2 is directive-based and built around `x-component`.

- No custom element registration required
- Supports on-page templates and remote templates
- Renders into Shadow DOM for style encapsulation
- Supports default and named slots from host templates
- Emits lifecycle events for loading, loaded, and error states
- Uses bounded caches for templates, remote responses, and stylesheets

## Install

### With a CDN

```html
<script
  defer
  src="https://unpkg.com/alpinejs-component@latest/dist/component.min.js"
></script>

<script defer src="https://unpkg.com/alpinejs@latest/dist/cdn.min.js"></script>
```

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

v2 uses an Alpine directive: `x-component`.

## Directive Reference

- `x-component="expression"`: render from an on-page `<template id="...">`
- `x-component.url="expression"`: render from a URL
- `x-component.url.external="expression"`: allow cross-origin `http(s)` URLs
- `x-component-styles="title-a,title-b"`: include matching document stylesheets
- `styles="..."`: alias for `x-component-styles`

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

Rendered component content is mounted in a Shadow DOM root.

Use `x-component-styles` (or `styles`) to include selected document stylesheets
by `title`.

```html
<style title="person-card">
  article {
    border: 1px solid #ddd;
  }
</style>

<div x-component="'person-card'" x-component-styles="person-card"></div>
```

Use `global` to include all local stylesheets:

```html
<div x-component="'person-card'" x-component-styles="global"></div>
```

## Slots

Slot templates can be declared on the host element with `x-slot`.

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

## Lifecycle Events

The host element emits lifecycle events:

- `x-component:loading` when URL loading starts
- `x-component:loaded` when render completes
- `x-component:error` when expression evaluation, loading, or rendering fails

Event detail payloads:

- `x-component:loading`: `{ source }`
- `x-component:loaded`: `{ source }`
- `x-component:error`: `{ source, error }`

`source` is the resolved template id/URL for load/render failures, and the raw
directive expression for expression-evaluation failures.

Evaluation failure behavior:

- If directive expression evaluation throws, the plugin emits
  `x-component:error` with the evaluation error.
- The component source is treated as empty, so any currently mounted content is
  cleared.

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

## Browser Support

This plugin targets modern browsers with support for:

- Shadow DOM
- `adoptedStyleSheets` (when using `x-component-styles` / `styles`)
- `CSSStyleSheet` (when using `x-component-styles` / `styles`)
- `template.content`

If your target environment lacks these APIs, use a compatibility strategy or
avoid Shadow DOM style adoption features.

## Caching

The plugin maintains bounded in-memory caches:

- Template fragments by template id (limit: 200)
- Remote template fetch promises by normalized URL (limit: 200)
- Adopted stylesheets by style target list (limit: 100)

When a cache exceeds its limit, oldest entries are evicted.

For URL mode, failed fetches are removed from cache so retries can succeed.

## Development

```shell
npm install
npm run build
```

Available scripts:

- `npm run build`: lint then build minified CDN + ESM outputs in `dist/`
- `npm run lint`: run ESLint with `--fix`

## Notes

- Missing templates and failed URL requests are handled with console
  warnings/errors and lifecycle error events.
- Expression evaluation failures dispatch `x-component:error` and clear mounted
  content for that host.
- URL responses are cached by URL.
- Template fragments are cached by template id.
- Stylesheets are cached by style target list.

## Migration From v1

v1:

```html
<x-component template="person"></x-component>
<x-component url="/public/person.html"></x-component>
```

v2:

```html
<div x-component="'person'"></div>
<div x-component.url="'/public/person.html'"></div>
```

`window.xComponent.name` custom-element renaming is no longer used because v2 is
directive-based.
