import { unref } from "vue";
import type { BaseStore } from "./createStore";
import {
  isGetter,
  isState,
  type VaxeeGetter,
  type VaxeeState,
} from "./reactivity";
import { isRequest, type VaxeeRequest } from "./request";

export function parseStore<Store extends BaseStore>(store: Store) {
  return Object.entries(store).reduce(
    (acc, [key, value]) => {
      if (isState(value)) {
        acc.states[key] = value;
      } else if (isGetter(value)) {
        acc.getters[key] = value;
      } else if (isRequest(value)) {
        acc.requests[key] = value;
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
      requests: {} as Record<string, VaxeeRequest<any, any>>,
      other: {} as Record<string, any>,
    }
  );
}
