---
outline: deep
---

# Reactivity

Vaxee provides functions for state management that are reactive by default. This means that when the state changes, the components that use this state will be updated automatically.

::: warning
You can't use `ref` or `computed` functions from Vue 3 directly in the store they won't be reactive.
:::

## State

State needed to store the data in the store and using it in any Vue component. It is the same as `ref` in Vue 3 but with our wrapper.

### Create

To create a state, use the `state` function from the `createStore` callback. You can create global stores by organizing them in the `stores` directory. This allows for better organization and reusability of state management across your application.

```js
import { createStore } from "vaxee";

export const useCounterStore = createStore("counter", ({ state }) => {
  const count = state(0);

  return {
    count,
  };
});
```

> [!TIP]
> See how to use a state in the [Store](/store#using-a-store) page.

> [!NOTE]
> Any property defined not using `state` or `getter` will be a normal property and won't be reactive, even if it's a `ref`.

### Update

We provide two ways to update the state: inside the store and outside the store.

#### Inside store

To update the state, you can use the `.value` property of the state.

```js
import { createStore } from "vaxee";

export const useCounterStore = createStore("counter", ({ state }) => {
  const count = state(0);

  const increment = () => {
    count.value++;
  };

  return {
    count,
    increment,
  };
});
```

#### Outside store

To update the state outside the store, please check the [Store](/store#using-a-store) page and **Using a store** section.

### TypeScript

You can pass a generic type to the `state` function to define the type of the state.

```ts
interface User {
  name: string;
  age: number;
}

export const useUserStore = createStore("user", ({ state }) => {
  const user = state<User>({
    name: "John",
    age: 25,
  });

  return {
    user,
  };
});
```

### Infer store state

You can infer the type of the store state by using the `$inferState` property. This is useful when you want to know the type of the store state.

```js
import { createStore } from "vaxee";

export const useCounterStore = createStore("counter", ({ state }) => {
  const count = state(0);

  return {
    count,
  };
});

export type CounterStore = typeof useCounterStore.$inferState;

// CounterStore is: { count: number }
```

## Getter

Getters are a way to compute some data based on the store state. They are the same as `computed` properties in Vue 3.

### Create

To create a getter, use the `getter` function from the `createStore` callback.

```js
import { createStore } from "vaxee";

export const useCounterStore = createStore("counter", ({ state, getter }) => {
  const count = state(0);
  const double = getter(() => count.value * 2);

  return {
    count,
    double,
  };
});
```

### TypeScript

You can pass a generic type to the `getter` function to define the type of the getter.

```ts
interface User {
  name: string;
  age: number;
}

export const useUserStore = createStore("user", ({ state, getter }) => {
  const user = state<User>({
    name: "John",
    age: 25,
  });
  const isAdult = getter<boolean>(() => user.value.age >= 18);

  return {
    user,
    isAdult,
  };
});
```
