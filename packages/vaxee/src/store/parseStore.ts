import { unref } from "vue";
import type { BaseStore } from "./createStore";
import {
  isGetter,
  isState,
  type VaxeeGetter,
  type VaxeeState,
} from "./reactivity";
import { isQuery, type VaxeeQuery } from "./query";

export function parseStore<Store extends BaseStore>(store: Store) {
  return Object.entries(store).reduce(
    (acc, [key, value]) => {
      if (isState(value)) {
        acc.states[key] = value;
      } else if (isGetter(value)) {
        acc.getters[key] = value;
      } else if (isQuery(value)) {
        acc.queries[key] = value;
      } else if (typeof value === "function") {
        acc.actions[key] = value;
      } else {
        acc.other[key] = unref(value);
      }
      return acc;
    },
    {
      states: {} as Record<string, VaxeeState<any>>,
      actions: {} as Record<string, (...args: any) => any>,
      getters: {} as Record<string, VaxeeGetter<any>>,
      queries: {} as Record<string, VaxeeQuery<any>>,
      other: {} as Record<string, any>,
    }
  );
}
