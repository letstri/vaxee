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

```ts{3,5,8}
import { createApp } from "vue";
import App from "./App.vue";
import { createVaxee } from "vaxee";

const vaxee = createVaxee();
const app = createApp(App);

app.use(vaxee);
app.$mount("#app");
```

### Nuxt

If you are using [Nuxt 3](https://nuxt.com/) or higher, you **don't need** to install the `vaxee` package. It is already included in the Nuxt 3 package.

::: code-group

```bash [npm]
npm i vaxee @vaxee/nuxt
```

```bash [yarn]
yarn add vaxee @vaxee/nuxt
```

```bash [pnpm]
pnpm i vaxee @vaxee/nuxt
```

```bash [bun]
bun i vaxee @vaxee/nuxt
```

:::

And then use it in your Nuxt project.

```ts
export default defineNuxtConfig({
  modules: ["@vaxee/nuxt"],
});
```

#### Auto-import

You may not import the `createStore` function to create stores in Nuxt because it is exposed globally. Also we reserve the `stores` dir at the root of your project inside `srcDir` folder to expose the stores globally. Customize the `stores` dir by setting the `dirs` option in the `vaxee` options.

```ts
export default defineNuxtConfig({
  modules: ["@vaxee/nuxt"],
  vaxee: {
    dirs: ["my-stores"],
  },
});

// or
export default defineNuxtConfig({
  modules: [
    [
      "@vaxee/nuxt",
      {
        dirs: ["my-stores"],
      },
    ],
  ],
});
```

#### Layers

If you are using Nuxt Layers, you should set the `vaxee` option in the `nuxt.config.ts` file due to the [limitation of the Nuxt Layers](https://nuxt.com/docs/guide/going-further/layers#relative-paths-and-aliases).

```ts
// nuxt.config.ts of some layer
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  modules: ["@vaxee/nuxt"],
  vaxee: {
    dirs: [join(currentDir, "./stores")],
  },
});
```

## Usage

Let's create a simple store with a counter.

```ts
import { createStore } from "vaxee";

export const useCounterStore = createStore(
  "counter",
  ({ state, getter, request }) => {
    const count = state(0);
    const double = getter(() => count.value * 2);
    const user = request(({ param }: { param: number }) =>
      fetch(`/users/${param}`).then((res) => res.json())
    );

    const increment = () => {
      count.value++;
    };

    return {
      count,
      double,
      increment,
      user,
    };
  }
);
```

Now, let's use this store in a component.

```vue
<script setup>
import { useCounterStore } from "./stores/counter";

const { count } = useCounterStore();
const { data: user, execute: executeUser } = await useCounterStore("user");

function updateUser(id: number) {
  executeUser(id);
}
</script>

<template>
  <div>
    <p>{{ count }}</p>
    <button @click="count++">Increment</button>
    <button @click="updateUser(1)">Update User</button>
  </div>
</template>
```

Try it on [StackBlitz](https://stackblitz.com/edit/vaxee-counter-playground?file=src%2Fstores%2Fcounter.ts,src%2FApp.vue&terminal=dev).
