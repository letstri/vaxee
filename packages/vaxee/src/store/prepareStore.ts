import type { BaseStore } from "./createStore";
import { useVaxee } from "../composables/useVaxee";
import { parseStore } from "./parseStore";
import type { VaxeeInternalStore } from "../plugin";
import { type VaxeeQueryState, checkPrivateQuery } from "./query";
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

  if (vaxee.state.value[name]) {
    for (const key in states) {
      states[key].value = vaxee.state.value[name][key];
    }
  }

  const preparedQueries = {} as Record<string, VaxeeQueryState<any>>;

  for (const key in queries) {
    checkPrivateQuery(queries[key]);

    const query = queries[key]._init(name, key);

    states[key] = state({
      data: query.data,
      error: query.error,
      status: query.status,
    });

    // TODO: rethink this due to saving the same data from states[key]
    preparedQueries[key] = query;
  }

  vaxee.state.value[name] = states;

  vaxee._stores[name] = {
    ...states,
    ...actions,
    ...getters,
    ...preparedQueries,
    ...(other as any),
    _state: states,
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
