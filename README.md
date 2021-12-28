# Apline JS Component

Alpine JS plugin `x-component` allows you to create reusable components, sprinkled with Alpine JS reactive data 🧁

## Example 👀

### Page

We can render on page components by using a `<template>` tag with an `id` that matches the modifier on `x-component` 🎉

In this example we are attaching `user` as the modifier which will look for the `<template id="user">` element

```html
<div
  x-data="{
    people: [
      {
        name: 'John',
        age: '25',
        job: 'Developer',
        image: '../images/john.jpg'
      },
      {
        name: 'Jane',
        age: '30',
        job: 'Designer',
        image: '../images/jane.jpg'
      }
    ]
  }"
>
  <ul>
    <template x-for="person in people">
      <template
        x-component.user="person.name,person.age,person.job,person.image"
      ></template>
    </template>
  </ul>
</div>

<template id="user">
  <li class="user-card">
    <img src="{person.image}" alt="{person.name}" />

    <h5>{person.name}</h5>

    <p>I am {person.age} years old and I work as {person.job}</p>
  </li>
</template>
```

### Global

We can also render global components 🌍

This works by checking the `public` folder for a HTML file that matches the attached name modifier

In this example, we are telling Alpine JS to check for the `public/user.html` file 🕵️‍♀️

To use a global component attach `url` at the end of `x-component`, after the name modifier

```html
<div
  x-data="{
    people: [
      {
        name: 'John',
        age: '25',
        job: 'Developer',
        image: '../images/john.jpg'
      },
      {
        name: 'Jane',
        age: '30',
        job: 'Designer',
        image: '../images/jane.jpg'
      }
    ]
  }"
>
  <ul>
    <template x-for="person in people">
      <template
        x-component.user.url="person.name,person.age,person.job,person.image"
      ></template>
    </template>
  </ul>
</div>
```

Then in `public/user.html` we have this

```html
<li class="user-card">
  <img src="{person.image}" alt="{person.name}" />

  <h5>{person.name}</h5>

  <p>I am {person.age} years old and I work as {person.job}</p>
</li>
```

#### Thoughts 🤔

**Why am I passing the data as a comma seperate list?**

It makes it easier to render reactive data from Alpine JS within the components as we can use moustache syntax

If you like this syntax, take a look at [AlpineJS Tash](https://github.com/markmead/alpinejs-tash)

**Can I pass arrays?**

I don't think this is something you'd be able to do without some very confusing code, but if you figure it out and it follows Alpine JS' easy to read syntax, create a PR 🙌 🤩

## Install 🌟

It's very easy to install Alpine JS plugins! 🙌

### CDN

```html
<script src="https://unpkg.com/alpinejs-component@1.0.0/dist/component.min.js"></script>
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
