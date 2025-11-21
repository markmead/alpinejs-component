# Alpine JS Component

Reusable HTML components powered by Alpine JS reactivity 🛸

## Install

### With a CDN

```html
<script
  defer
  src="https://unpkg.com/alpinejs-component@latest/dist/component.min.js"
></script>

<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

### With a Package Manager

```shell
npm install -D alpinejs-component

yarn add -D alpinejs-component
```

```js
import Alpine from 'alpinejs'
import component from 'alpinejs-component'

Alpine.plugin(component)

Alpine.start()
```

## Example

### Using Components

You can use components in two ways:

1. **As an HTML element** (using `<x-component>`)
2. **As a directive** (using `x-component` on any element)

Both approaches support the same features and attributes.

### On Page Components

You can render on page components by using a `<template>` with an `id` that
matches the `template` attribute on the component.

#### Using the HTML Element

Here we are rendering the component HTML found in `<template id="person">`
element.

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
    <template x-for="person in people">
      <x-component template="person" x-data="{ item: person }"></x-component>
    </template>
  </ul>
</div>

<template id="person">
  <li>
    <h2 x-text="item.name"></h2>

    <p x-text="item.age"></p>

    <ul>
      <template x-for="skill in item.skills">
        <li x-text="skill"></li>
      </template>
    </ul>
  </li>
</template>
```

#### Using the Directive

You can also use the `x-component` directive on any element:

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
    <template x-for="person in people">
      <li x-component template="person" x-data="{ item: person }"></li>
    </template>
  </ul>
</div>

<template id="person">
  <div>
    <h2 x-text="item.name"></h2>

    <p x-text="item.age"></p>

    <ul>
      <template x-for="skill in item.skills">
        <li x-text="skill"></li>
      </template>
    </ul>
  </div>
</template>
```

### Global Components

If you don't want on page components you can use the `url` attribute which
accepts a path to the HTML component.

#### Using the HTML Element

Here we are telling Alpine JS to fetch the HTML from `/public/person.html`
within the codebase.

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
    <template x-for="person in people">
      <x-component
        url="/public/person.html"
        x-data="{ item: person }"
      ></x-component>
    </template>
  </ul>
</div>
```

#### Using the Directive

You can achieve the same result using the directive:

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
    <template x-for="person in people">
      <li
        x-component
        url="/public/person.html"
        x-data="{ item: person }"
      ></li>
    </template>
  </ul>
</div>
```

Then we'd have a file `/public/person.html` which could look like this.

```html
<div>
  <h2 x-text="item.name"></h2>

  <p x-text="item.age"></p>

  <ul>
    <template x-for="skill in item.skills">
      <li x-text="skill"></li>
    </template>
  </ul>
</div>
```

## Dynamic Templates

You can pass `template` or `url` as a dynamic value, here's an example.

#### Using the HTML Element

```html
<div
  x-data="{
    components: [
      {
        template: '/public/person.html',
        data: { name: 'John', age: '25', skills: ['JavaScript', 'CSS'] }
      },
      {
        template: '/public/person.html',
        data: { name: 'Jane', age: '30', skills: ['Laravel', 'MySQL', 'jQuery'] }
      },
    ]
  }"
>
  <ul>
    <template x-for="component in components">
      <x-component
        :template="component.template"
        x-data="{ item: component.data }"
      ></x-component>

      <!-- Or -->

      <x-component
        :url="component.template"
        x-data="{ item: component.data }"
      ></x-component>
    </template>
  </ul>
</div>
```

#### Using the Directive

```html
<div
  x-data="{
    components: [
      {
        template: '/public/person.html',
        data: { name: 'John', age: '25', skills: ['JavaScript', 'CSS'] }
      },
      {
        template: '/public/person.html',
        data: { name: 'Jane', age: '30', skills: ['Laravel', 'MySQL', 'jQuery'] }
      },
    ]
  }"
>
  <ul>
    <template x-for="component in components">
      <li
        x-component
        :template="component.template"
        x-data="{ item: component.data }"
      ></li>

      <!-- Or -->

      <li
        x-component
        :url="component.template"
        x-data="{ item: component.data }"
      ></li>
    </template>
  </ul>
</div>
```

## Styling Components

### Including Stylesheets

You can use `styles` attribute to specify which stylesheets to include.

#### Using the HTML Element

```html
<style title="person">
  /* ... */
</style>

<x-component
  template="person"
  styles="person"
  x-data="{ item: person }"
></x-component>
```

#### Using the Directive

```html
<style title="person">
  /* ... */
</style>

<div
  x-component
  template="person"
  styles="person"
  x-data="{ item: person }"
></div>
```

You can also include multiple stylesheets by separating them with a comma.

```html
<style title="person">
  /* ... */
</style>

<style title="general">
  /* ... */
</style>

<x-component
  template="person"
  styles="person,general"
  x-data="{ item: person }"
></x-component>
```

Or, if you want to include all stylesheets you can use `styles="global"`. This works the same way with both the HTML element and directive approaches.

### Inline Stylesheet

You can add a `<style>` element with the components CSS to the component itself.

```html
<div>
  <style>
    .example {
      background: #00f;
    }
  </style>

  <p class="example" x-text="message"> </p>
</div>
```

## Renaming Component

If you need to change the name `x-component`, you can do so by setting the
global `xComponent` object. This is necessary because blade components start
with `x-`, which can cause conflicts.

```js
window.xComponent = {
  name: 'a-component',
}
```

You will then call components like this:

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
    <template x-for="person in people">
      <a-component
        url="/public/person.html"
        x-data="{ item: person }"
      ></a-component>
    </template>
  </ul>
</div>
```

### Stats

![](https://img.shields.io/bundlephobia/min/alpinejs-component)
![](https://img.shields.io/npm/v/alpinejs-component)
![](https://img.shields.io/npm/dt/alpinejs-component)
![](https://img.shields.io/github/license/markmead/alpinejs-component)
