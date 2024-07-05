---
outline: deep
---

# State

Vaxee provides a `state` function for reactive state management. This function ensures that when the state changes, all components automatically update accordingly. It is similar to Vue 3's `ref` feature, but with our own wrapper.

## Create a State

To create a state, use the `state` function from the `createStore` callback. You can create global stores by organizing them in the `stores` directory. This allows for better organization and reusability of state management across your application.

```ts
import { createStore } from "vaxee";

export const useCounterStore = createStore("counter", ({ state }) => {
  const count = state(0);

  return {
    count,
  };
});
```

> [!TIP]
> See how to use a `state` in the [Store](/store#using-a-store) page and **Using a store** section.

> [!WARNING]
> Any property that is not defined using the `state` function won't be a reactive property, even if it's a `ref`.

## Update the State

We provide two ways to update the state: inside the store and outside the store.

### Inside store

To update the state, you can use the `.value` property of the state.

```ts
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

### Outside store

To update the state outside the store, please check the [Store](/store#using-a-store) page and **Using a store** section.

### Outside components

To update the state outside any **component** or **composable** function, you can use it like a typical store but please ensure that plugin **was installed** first.

```ts
router.beforeEach(() => {
  const counterStore = useCounterStore();

  counterStore.count++;

  return true;
});
```

## TypeScript

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

## Infer store state

You can infer the type of the store state by using the `$inferState` property. This is useful when you want to know the type of the store state.

```ts
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
