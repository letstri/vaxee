import { toRefs } from "vue";
import type { BaseStore } from "./createStore";
import { useVaxee } from "../composables/useVaxee";
import { parseStore } from "./parseStore";
import type { VaxeeInternalStore } from "../plugin";
import type { VaxeeQueryState } from "./query";
import { state } from "./reactivity";

export function prepareStore<Store extends BaseStore>(
  name: string,
  store: Store
): VaxeeInternalStore<Store> {
  const vaxee = useVaxee();

  if (vaxee._stores[name]) {
    return vaxee._stores[name] as VaxeeInternalStore<Store>;
  }

  const { states, actions, getters, queries, other } = parseStore(store);

  const preparedQueries = {} as Record<string, VaxeeQueryState<any>>;

  if (vaxee.state.value[name]) {
    for (const key in states) {
      states[key].value = vaxee.state.value[name][key];
    }
  }

  for (const key in queries) {
    const query = queries[key]({
      initial:
        vaxee.state.value[name]?.[key] &&
        vaxee.state.value[name][key].status !== "pending"
          ? {
              data: vaxee.state.value[name][key].data,
              status: vaxee.state.value[name][key].status,
              error: vaxee.state.value[name][key].error,
            }
          : undefined,
    });

    states[key] = state({
      data: query.data,
      error: query.error,
      status: query.status,
    });

    preparedQueries[key] = query;
  }

  vaxee.state.value[name] = states;

  vaxee._stores[name] = {
    ...toRefs(vaxee.state.value[name]),
    ...actions,
    ...getters,
    ...preparedQueries,
    ...(other as any),
    _state: vaxee.state.value[name],
    _actions: actions,
    _getters: getters,
    _queries: preparedQueries,
    _other: other,
  } satisfies VaxeeInternalStore<Store>;

  // To use the state directly by _state = { ... }
  Object.defineProperty(vaxee._stores[name], "_state", {
    get: () => vaxee.state.value[name],
    set: (state) => {
      Object.assign(vaxee.state.value[name], state);
    },
  });

  return vaxee._stores[name] as VaxeeInternalStore<Store>;
}
