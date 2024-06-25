import { reactive, toRefs } from "vue";
import type {
  VaxeeStoreActions,
  VaxeeStoreGetters,
  VaxeeStoreOther,
  VaxeeStoreState,
} from "../helpers";
import type { BaseStore, VaxeeStore } from "./createStore";
import { useVaxee } from "../composables/useVaxee";
import {
  isGetter,
  isState,
  type VaxeeGetter,
  type VaxeeState,
} from "./reactivity";
import { parseStore } from "./parseStore";

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
    for (const key in vaxee.state.value[name]) {
      states[key].value = vaxee.state.value[name][key];
    }
  }

  vaxee.state.value[name] = states;

  vaxee._stores[name] = {
    ...toRefs(vaxee.state.value[name] as VaxeeStoreState<Store>),
    ...(actions as VaxeeStoreActions<Store>),
    ...(getters as VaxeeStoreGetters<Store>),
    ...(other as VaxeeStoreOther<Store>),
    _state: vaxee.state.value[name] as VaxeeStoreState<Store>,
    _actions: actions as VaxeeStoreActions<Store>,
    _getters: getters as VaxeeStoreGetters<Store>,
    _other: other,
  } satisfies VaxeeStore<Store>;

  // To use the state directly by _state = { ... } instead of computed get and set
  Object.defineProperty(vaxee._stores[name], "_state", {
    get: () => vaxee.state.value[name],
    set: (state) => {
      Object.assign(vaxee.state.value[name], state);
    },
  });

  return vaxee._stores[name] as VaxeeStore<Store>;
}
