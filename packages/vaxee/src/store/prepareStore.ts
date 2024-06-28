import type { BaseStore, VaxeeStore } from "./createStore";
import { useVaxee } from "../composables/useVaxee";
import { parseStore } from "./parseStore";
import type {
  VaxeeStoreActions,
  VaxeeStoreGetters,
  VaxeeStoreOther,
  VaxeeStoreState,
} from "../helpers";
import { toRefs } from "vue";

export function prepareStore<Store extends BaseStore>(
  name: string,
  store: Store
): VaxeeStore<Store> {
  const vaxee = useVaxee();

  if (vaxee._stores[name]) {
    return vaxee._stores[name] as VaxeeStore<Store>;
  }

  const { states, actions, getters, other } = parseStore(store);

  if (vaxee.state.value[name]) {
    for (const key in states) {
      states[key].value = vaxee.state.value[name][key];
    }
  }

  vaxee.state.value[name] = states;

  vaxee._stores[name] = {
    ...(actions as VaxeeStoreActions<Store>),
    ...(getters as VaxeeStoreGetters<Store>),
    ...(toRefs(vaxee.state.value[name]) as VaxeeStoreState<Store>),
    ...(other as any),
    _state: vaxee.state.value[name] as VaxeeStoreState<Store>,
    _actions: actions as VaxeeStoreActions<Store>,
    _getters: getters as VaxeeStoreGetters<Store>,
    _other: other as any,
  } satisfies VaxeeStore<Store>;

  // To use the state directly by _state = { ... }
  Object.defineProperty(vaxee._stores[name], "_state", {
    get: () => vaxee.state.value[name],
    set: (state) => {
      Object.assign(vaxee.state.value[name], state);
    },
  });

  return vaxee._stores[name] as VaxeeStore<Store>;
}
