import { computed, toRefs } from "vue";
import type {
  VaxeeStoreActions,
  VaxeeStoreGetters,
  VaxeeStoreState,
} from "../helpers";
import { type BaseStore, type VaxeeStore } from "./createStore";
import { parseStore } from "./parseStore";
import { useVaxee } from "../composables/useVaxee";
import clone from "lodash.clonedeep";

export function prepareStore<Store extends BaseStore>(
  store: Store,
  name: string
): VaxeeStore<Store> {
  const vaxee = useVaxee();

  if (vaxee._stores[name]) {
    return vaxee._stores[name] as VaxeeStore<Store>;
  }

  const {
    state: initialState,
    actions: initialActions,
    getters: initialGetters,
  } = parseStore(store);

  const state = initialState as VaxeeStoreState<Store>;

  vaxee.state.value[name] ||= clone(state);

  const actions = Object.entries(initialActions).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: (value as () => any).bind(vaxee.state.value[name]),
    }),
    {} as VaxeeStoreActions<Store>
  );
  const getters = Object.entries(initialGetters).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key.slice(1)]: computed(
        (value as () => any).bind(vaxee.state.value[name])
      ),
    }),
    {} as VaxeeStoreGetters<Store>
  );

  vaxee._stores[name] = {
    ...toRefs(vaxee.state.value[name] as VaxeeStoreState<Store>),
    ...actions,
    ...getters,
    _state: vaxee.state.value[name] as VaxeeStoreState<Store>,
    _initialState: Object.freeze(clone(state)),
    _actions: actions,
    _getters: getters,
    reset: function () {
      vaxee._stores[name]._state = clone(state);
    },
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
