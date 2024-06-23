import { computed, toRefs } from "vue";
import type { VaxeeStoreState, VaxeeStoreActions } from "../helpers";
import { type BaseStore, type VaxeeStore } from "./defineStore";
import { parseStore } from "./parseStore";
import { useVaxee } from "../composables/useVaxee";

export function prepareStore<
  Store extends BaseStore,
  State extends VaxeeStoreState<Store>,
  Actions extends VaxeeStoreActions<Store>
>(store: (options: any) => Store, name: string): VaxeeStore<State, Actions> {
  const vaxee = useVaxee();

  if (vaxee._stores[name]) {
    return vaxee._stores[name] as VaxeeStore<State, Actions>;
  }

  const getter = <Value>(callback: (state: State) => Value) =>
    computed(() => callback(vaxee.state.value[name] as State));

  const options = {
    getter,
  };

  const { state: initialState, actions: initialActions } = parseStore(
    store(options)
  );

  vaxee.state.value[name] ||= initialState;

  const actions = Object.fromEntries(
    Object.entries(initialActions).map(([key, func]) => [
      key,
      (func as any).bind(vaxee.state.value[name]),
    ])
  ) as Actions;

  vaxee._stores[name] = {
    ...toRefs(vaxee.state.value[name] as State),
    ...actions,
    $state: vaxee.state.value[name] as State,
    $actions: actions,
    $reset() {
      this.$state = parseStore(store(options)).state as State;
    },
  } satisfies VaxeeStore<State, Actions>;

  // To use the state directly by $state = { ... } instead of computed get and set
  Object.defineProperty(vaxee._stores[name], "$state", {
    get: () => vaxee.state.value[name],
    set: (state) => {
      Object.assign(vaxee.state.value[name], state);
    },
  });

  return vaxee._stores[name];
}
