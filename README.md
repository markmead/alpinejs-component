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

### On Page Components

You can render on page components by using a `<template>` with an `id` that
matches the `template` attribute on the component.

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

### Global Components

If you don't want on page components you can use the `url` attribute which
accepts a path to the HTML component.

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

Then we'd have a file `/public/person.html` which could look like this.

```html
<li>
  <h2 x-text="item.name"></h2>

  <p x-text="item.age"></p>

  <ul>
    <template x-for="skill in item.skills">
      <li x-text="skill"></li>
    </template>
  </ul>
</li>
```

## Dynamic Templates

You can pass `template` or `url` as a dynamic value, here's an example.

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

      // Or

      <x-component
        :url="component.template"
        x-data="{ item: component.data }"
      ></x-component>
    </template>
  </ul>
</div>
```

## Styling Components

### Including Stylesheets

You can use `styles` attribute to specify which stylesheets to include.

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

Or, if you want to include all stylesheets you can use `styles="global"`

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
