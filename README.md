# Apline JS Component

Create reusable HTML components sprinkled with Alpine JS reactive data 🧁

## Example 👀

### Page

We can render on page components by using a `<template>` tag with an `id` that matches the `template` attribute 🎉

In this example we are using the `person` template to find the `<template id="person">` element.

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
      <x-component-wrapper
        x-component
        template="person"
        x-data="{ item: person }"
      ></x-component-wrapper>
    </template>
  </ul>
</div>

<template id="person">
  <li class="user-card">
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

### Global

We can also render global components 🌍

This works by passing a URL for an HTML file in the `url` attribute that matches to a HTML file within the app

In this example, we are telling Alpine JS to get the HTML from `public/person.html` 🕵️‍♀️

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
      <x-component-wrapper
        x-component
        url="/public/person.html"
        x-data="{ item: person }"
      ></x-component-wrapper>
    </template>
  </ul>
</div>
```

Then in `public/person.html` we have this

```html
<li class="user-card">
  <h2 x-text="item.name"></h2>

  <p x-text="item.age"></p>

  <ul>
    <template x-for="skill in item.skills">
      <li x-text="skill"></li>
    </template>
  </ul>
</li>
```

## Install 🌟

It's very easy to install Alpine JS plugins! 🙌

### CDN

```html
<script src="https://unpkg.com/alpinejs-component@1.x.x/dist/component.min.js"></script>
<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

### NPM/Yarn

```shell
npm i -D alpinejs-component

yarn add -D alpinejs-component
```

Then you can register the plugin.

```js
import Alpine from "alpinejs";
import component from "alpinejs-component";

Alpine.plugin(component);

window.Alpine = Alpine;

Alpine.start();
```

### Stats 📊

Here's some stats about the Alpine JS component package! As you can see, it's tiny 🤏

![](https://img.shields.io/bundlephobia/min/alpinejs-component)
![](https://img.shields.io/npm/v/alpinejs-component)
![](https://img.shields.io/npm/dt/alpinejs-component)
![](https://img.shields.io/github/license/markmead/alpinejs-component)
