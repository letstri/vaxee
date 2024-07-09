import { watch } from "vue";
import type { BaseStore } from "./createStore";
import { useVaxee } from "../composables/useVaxee";
import { parseStore } from "./parseStore";
import type { VaxeeInternalStore } from "../plugin";
import type { VaxeeQueryState } from "./query";
import { state } from "./reactivity";
import { IS_CLIENT } from "../constants";

export function prepareStore<Store extends BaseStore>(
  name: string,
  store: Store
): VaxeeInternalStore<Store> {
  const vaxee = useVaxee();

  if (vaxee._stores[name]) {
    return vaxee._stores[name] as VaxeeInternalStore<Store>;
  }

  const { states, actions, getters, queries, other } = parseStore(store);

  for (const key in states) {
    if (states[key]._options.persist) {
      const { get: _get, set: _set } =
        typeof states[key]._options.persist === "object"
          ? (states[key]._options.persist as {
              get: (key: string) => any;
              set: (key: string, value: any) => void;
            })
          : {
              get: (key: string) => {
                if (vaxee._options.persist) {
                  return vaxee._options.persist.get(key);
                }

                if (!IS_CLIENT) {
                  return null;
                }

                return JSON.parse(localStorage.getItem(key) || "null");
              },
              set: (key: string, value: any) => {
                if (vaxee._options.persist) {
                  vaxee._options.persist?.set(key, value);
                  return;
                }

                if (IS_CLIENT) {
                  JSON.stringify(localStorage.setItem(key, value));
                }
              },
            };

      const persisted = _get(`${name}.${key}`);

      if (persisted || vaxee.state.value[name]?.[key]) {
        states[key].value = persisted || vaxee.state.value[name][key];
      }

      watch(
        states[key],
        (value) => {
          _set(`${name}.${key}`, value);
        },
        { deep: true }
      );
    } else if (vaxee.state.value[name]) {
      states[key].value = vaxee.state.value[name][key];
    }
  }

  const preparedQueries = {} as Record<string, VaxeeQueryState<any>>;

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
