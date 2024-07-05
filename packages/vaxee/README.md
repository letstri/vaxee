<p align="center">
<a href="https://vaxee.letstri.dev" target="_blank" rel="noopener noreferrer">
<img height="70" src="https://vaxee.letstri.dev/logo.svg"  alt="Nixle logo">
</a>
</p>
<p  align="center">
<strong>The State Manager for Vue 3</strong><br>Store your data across whole application
</p>
<p align="center">
<a href="https://www.npmjs.com/package/vaxee"><img  src="https://img.shields.io/npm/v/vaxee.svg?style=for-the-badge"></a>
<a href="https://nixle.letstri.dev"><img  src="https://img.shields.io/badge/you_want-vaxee-green?style=for-the-badge"></a>
</p>

## Overview

Vaxee is a simple and easy-to-use library for Vue 3 to manage the state of your application.

- ✨ Simple and intuitive API.
- 💪 Incredible TypeScript support.

## Documentation

You can find the documentation [on the website](https://vaxee.letstri.dev).

## Installation

### Vue 3

```bash
npm install vaxee
```

And then use it in your Vue 3 project.

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { createVaxee } from "vaxee";

const vaxee = createVaxee();
const app = createApp(App);

app.use(vaxee);
app.$mount("#app");
```

### Nuxt

If you are using Nuxt 3 or higher, you don't need to install the `vaxee` package. It is already included in the Nuxt 3 package.

```bash
npm install @vaxee/nuxt
```

And then use it in your Nuxt project.

```ts
export default defineNuxtConfig({
  modules: ["@vaxee/nuxt"],
});
```

## Usage

Let's create a simple store with a counter.

```ts
import { createStore } from "vaxee";

export const useCounterStore = createStore("counter", ({ state, getter }) => {
  const count = state(0);
  const double = getter(() => count.value * 2);

  const increment = () => {
    count.value++;
  };

  return {
    count,
    double,
    increment,
  };
});
```

Now, let's use this store in a component.

```vue
<script setup>
import { useCounterStore } from "../stores/counter";

const { count, double, increment } = useCounterStore();
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ double }}</p>
    <button @click="count++">count++</button>
    <button @click="increment">increment</button>
  </div>
</template>
```

## Author

© [letstri](https://letstri.dev), released under the [MIT](https://github.com/letstri/vaxee/blob/main/LICENSE) license.
