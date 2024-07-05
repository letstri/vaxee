---
outline: deep
---

# Actions

Actions are any functions that are used to update the state in a store. They should be returned from a store and are responsible for modifying the state.

## Create action

To create an action, just define a function inside the store callback and return it.

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
