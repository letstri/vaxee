---
outline: deep
---

# Getters

Vaxee provides a `getter` function for creating **reactive** getters. This function ensures that when the getter **changes**, all components automatically **update** accordingly. It needs for creating **computed** properties based on the **another** reactive properties.

## Create a Getter

To create a getter, use the `getter` function from the `createStore` callback.

```ts
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

> [!TIP]
> See how to use a `getter` in the [Store](/store#using-a-store) page and **Using a store** section.

> [!WARNING]
> Any property that is not defined using the `getter` function won't be a reactive property, even if it's a `computed`.

## TypeScript

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
