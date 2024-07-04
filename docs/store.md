---
outline: deep
---

# Store

The main purpose of a store is to provide ability to store and manage some parts of the application state. It should be used to store data that is shared between multiple components.

## Creating a store

To create a store, use the `createStore` function and pass a **name** of the store and a **callback** function that returns the store object.

```js
import { createStore } from "vaxee";

export const useCounterStore = createStore("counter", ({ state, getter }) => {
  const count = state(0);
  const double = getter(() => count.value * 2);

  const increment = () => {
    count.value++;
  };

  return {
    count,
    increment,
    double,
  };
});
```

This was a simple example of a store with a `state`, for more complex stores look at other **Core Concepts**.

## Using a store

We provide several ways to use a store in a component.

### Destructuring

The most common way to use a store is to destructure the store object.

```vue
<script setup>
import { useCounterStore } from "../stores/counter";

const { count, increment } = useCounterStore();

// count is: Ref<number>
// increment is: () => void
</script>

<template>
  <div>
    <p>{{ count }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

Each property defined with `state` or `getter` will be reactive in the component.

### Object

You can also use the store object directly.

```vue
<script setup>
import { useCounterStore } from "../stores/counter";

const store = useCounterStore();

// store is:
// {
//   count: Ref<number>,
//   increment: () => void,
// }
</script>

<template>
  <div>
    <p>{{ store.count }}</p>
    <button @click="store.increment">Increment</button>
  </div>
</template>
```

### Escape .value

If you want to avoid using `.value` in the component, you can pass `false` as an argument to the store when using it.

```vue
<script setup>
import { useCounterStore } from "../stores/counter";

const store = useCounterStore(false);

// store is:
// {
//   count: number,
//   increment: () => void,
// }
</script>

<template>
  <div>
    <p>{{ store.count }}</p>
    <button @click="store.increment">Increment</button>
  </div>
</template>
```

::: warning
With the `false` argument, you can't use destructuring.
:::

```js
import { useCounterStore } from "../stores/counter";

const { count } = useCounterStore(false);

count++; // Won't work
```

### Pick a prop

You can also select a **single property** from the store. If a property is defined with `state`, it will be a `ref` and you can use `v-model` with it. Properties defined with `getter` will be `computed` properties. All other properties will be plain.

```vue
<script setup>
import { useCounterStore } from "../stores/counter";

const count = useCounterStore("count");
// Ref<number>
const increment = useCounterStore("increment");
// () => void
</script>

<template>
  <div>
    <p>{{ count }}</p>
    <button @click="count++">Increment</button>
    <button @click="increment">Increment</button>
  </div>
</template>
```

## How it works

A store is created using the `createStore` function. This function accepts two arguments: the name of the store and a callback function that returns the store object.

First argument is the name of the store needs to be unique across the application due to saving the state in the global state object.

We created a wrappers around `ref` and `computed` due to more control the data and to provide more features.

### Under the hood

We do not use `effectScope` from Vue to create stores in order to avoid side effects in stores. Instead, we have a single `ref` under the hood to store the entire state of the stores. In general, it can be visualized like this:

```js
// Create a simple store
createStore("counter", ({ state }) => ({
  count: state(0),
}));

// Somewhere inside Vaxee
const state = ref({
  counter: {
    count: 0,
  },
});
```
