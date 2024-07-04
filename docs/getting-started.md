---
outline: deep
---

# Getting Started

## Installation

### Vue

You can install Vaxee using any package manager such as npm, yarn, pnpm, or bun.

::: code-group

```bash [npm]
npm i vaxee
```

```bash [yarn]
yarn add vaxee
```

```bash [pnpm]
pnpm add vaxee
```

```bash [bun]
bun i vaxee
```

:::

And then use it in your Vue 3 project.

```js{3,5,8}
import { createApp } from "vue";
import App from "./App.vue";
import { createVaxeePlugin } from "vaxee";

const vaxee = createVaxeePlugin();
const app = createApp(App);

app.use(vaxee);
app.$mount("#app");
```

### Nuxt

If you are using [Nuxt 3](https://nuxt.com/) or higher, you **don't need** to install the `vaxee` package. It is already included in the Nuxt 3 package.

::: code-group

```bash [npm]
npm i @vaxee/nuxt
```

```bash [yarn]
yarn add @vaxee/nuxt
```

```bash [pnpm]
pnpm add @vaxee/nuxt
```

```bash [bun]
bun i @vaxee/nuxt
```

:::

And then use it in your Nuxt project.

```js
export default defineNuxtConfig({
  modules: ["@vaxee/nuxt"],
});
```

::: tip
You may not import the `createStore` function to create stores in Nuxt because it is exposed globally.
:::

## Usage

Let's create a simple store with a counter.

```js
import { createStore } from "vaxee";

export const useCounterStore = createStore("counter", ({ state }) => ({
  count: state(0),
}));
```

Now, let's use this store in a component.

```vue
<script setup>
import { useCounterStore } from "../stores/counter";

const { count } = useCounterStore();
</script>

<template>
  <div>
    <p>{{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>
```

Try it on [StackBlitz](https://stackblitz.com/edit/vaxee-counter-playground?file=src%2Fstores%2Fcounter.ts,src%2FApp.vue&terminal=dev).

## Server-Side Rendering

::: warning
If you are using the Nuxt package, you can skip this section. The code below is already included in the Nuxt package.
:::

To use Vaxee with server-side rendering (SSR), you need to use **save** your data before sending it to the client and then restore it on the client side. You can do it by inserting your data into the HTML response.

::: tip
When inserting data into the HTML response, make sure to properly escape it. You can use the [devalue](https://github.com/nuxt-contrib/devalue) package for this purpose.
:::

To restore same data on the client side, you can use the following code.

```js{8-12}
import { createApp } from "vue";
import App from "./App.vue";
import { createVaxeePlugin } from "vaxee";

const vaxee = createVaxeePlugin();
const app = createApp(App);

if (typeof window !== "undefined") {
  vaxee.state.value = JSON.parse(
    document.getElementById("__vaxee__").textContent
  );
}

app.use(vaxee);
app.$mount("#app");
```

The main point is to set the `vaxee.state.value` with the data **before using any store**.
