import { computed, toRefs } from "vue";
import type { VaxeeStoreState, VaxeeStoreActions } from "../helpers";
import { type BaseStore, type VaxeeStore } from "./createStore";
import { parseStore } from "./parseStore";
import { useVaxee } from "../composables/useVaxee";

export function prepareStore<Store extends BaseStore>(
  store: (options: any) => Store,
  name: string
): VaxeeStore<Store> {
  const vaxee = useVaxee();

  if (vaxee._stores[name]) {
    return vaxee._stores[name] as VaxeeStore<Store>;
  }

  type State = VaxeeStoreState<Store>;
  type Actions = VaxeeStoreActions<Store>;

  const getter = <Value>(callback: (state: State) => Value) =>
    computed(() => callback(vaxee.state.value[name] as State));

  const options = {
    getter,
  };

  const { state: initialState, actions } = parseStore(store(options));

  vaxee.state.value[name] ||= initialState;

  vaxee._stores[name] = {
    ...toRefs(vaxee.state.value[name] as State),
    ...(actions as Actions),
    $state: vaxee.state.value[name] as State,
    $actions: actions as Actions,
    $reset() {
      this.$state = parseStore(store(options)).state as State;
    },
  } satisfies VaxeeStore<Store>;

  // To use the state directly by $state = { ... } instead of computed get and set
  Object.defineProperty(vaxee._stores[name], "$state", {
    get: () => vaxee.state.value[name],
    set: (state) => {
      Object.assign(vaxee.state.value[name], state);
    },
  });

  return vaxee._stores[name];
}
