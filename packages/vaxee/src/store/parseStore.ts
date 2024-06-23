import type { VaxeeStoreState, VaxeeStoreActions } from "../helpers";
import type { BaseStore } from "./defineStore";

export function parseStore<Store extends BaseStore>(
  store: Store
): {
  state: VaxeeStoreState<Store>;
  actions: VaxeeStoreActions<Store>;
} {
  return Object.entries(store).reduce(
    (acc, [key, value]) => {
      if (typeof value === "function") {
        (acc.actions as any)[key] = value;
      } else {
        (acc.state as any)[key] = value;
      }
      return acc;
    },
    {
      state: {},
      actions: {},
    } as {
      state: VaxeeStoreState<Store>;
      actions: VaxeeStoreActions<Store>;
    }
  );
}
