# Alpine JS Component

Reusable HTML components powered by Alpine JS reactivity.

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
npm install -D alpinejs-component
```

```js
import Alpine from 'alpinejs'
import component from 'alpinejs-component'

Alpine.plugin(component)
Alpine.start()
```

## Usage

v2 uses an Alpine directive: `x-component`.

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
- `x-component:error` when loading/rendering fails

```html
<div
  x-component.url="'/public/person-card.html'"
  x-on:x-component:loaded="console.log('component ready', $event.detail)"
  x-on:x-component:error="console.error('component failed', $event.detail)"
></div>
```

## Notes

- Missing templates and failed URL requests are handled with console
  warnings/errors.
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
<div x-component.url="/public/person.html"></div>
```

`window.xComponent.name` custom-element renaming is no longer used because v2 is
directive-based.

### Stats

![](https://img.shields.io/bundlephobia/min/alpinejs-component)
![](https://img.shields.io/npm/v/alpinejs-component)
![](https://img.shields.io/npm/dt/alpinejs-component)
![](https://img.shields.io/github/license/markmead/alpinejs-component)
