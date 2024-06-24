import type { BaseStore } from "./createStore";

export function parseStore<Store extends BaseStore>(store: Store) {
  return Object.entries(store).reduce(
    (acc, [key, value]) => {
      if (key.startsWith("$") && typeof value === "function") {
        (acc.getters as any)[key] = value;
      } else if (typeof value === "function") {
        (acc.actions as any)[key] = value;
      } else {
        (acc.state as any)[key] = value;
      }
      return acc;
    },
    {
      state: {} as any,
      actions: {} as any,
      getters: {} as any,
    }
  );
}
