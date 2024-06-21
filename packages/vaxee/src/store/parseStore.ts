import type {
  FunctionProperties,
  NonFunctionProperties,
} from "../models/helpers";
import type { BaseStore } from "./defineStore";

export function parseStore<Store extends BaseStore>(
  store: Store,
  context: BaseStore | null
): {
  state: NonFunctionProperties<Store>;
  actions: FunctionProperties<Store>;
} {
  return Object.entries(store).reduce(
    (acc, [key, value]) => {
      if (typeof value === "function") {
        (acc.actions as any)[key] = context ? value.bind(context) : value;
      } else {
        (acc.state as any)[key] = value;
      }
      return acc;
    },
    {
      state: {},
      actions: {},
    } as {
      state: NonFunctionProperties<Store>;
      actions: FunctionProperties<Store>;
    }
  );
}
