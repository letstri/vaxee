import { toRefs } from "vue";
import type {
  FunctionProperties,
  NonFunctionProperties,
} from "../models/helpers";
import { getVaxeeInstance } from "../plugin";
import type { BaseStore, VaxeeStore } from "./defineStore";
import { parseStore } from "./parseStore";

export function prepareStore<
  Store extends BaseStore,
  State extends NonFunctionProperties<Store>,
  Actions extends FunctionProperties<Store>
>(store: () => Store, name: string) {
  const vaxee = getVaxeeInstance()!;

  const { state: initialState, actions: initialActions } = parseStore(store());

  vaxee.state.value[name] ||= initialState;

  const actions = Object.fromEntries(
    Object.entries(initialActions).map(([key, func]) => [
      key,
      (func as () => {}).bind(vaxee.state.value[name]),
    ])
  ) as Actions;

  // Recreate the store if doesn't exist
  vaxee._stores[name] ||= {
    ...toRefs(vaxee.state.value[name] as State),
    ...actions,
    $state: vaxee.state.value[name] as State,
    $actions: actions,
    $reset() {
      this.$state = parseStore(store()).state as State;
    },
  } satisfies VaxeeStore<State, Actions, true>;

  // To use the state directly by $state = { ... } instead of computed get and set
  Object.defineProperty(vaxee._stores[name], "$state", {
    get: () => vaxee.state.value[name],
    set: (state) => {
      Object.assign(vaxee.state.value[name], state);
    },
  });
}
