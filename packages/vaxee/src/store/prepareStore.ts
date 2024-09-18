import type { BaseStore } from "./createStore";
import { useVaxee } from "../composables/useVaxee";
import { parseStore } from "./parseStore";
import type { VaxeeInternalStore } from "../plugin";
import { type VaxeeRequest, checkPrivateRequest } from "./request";
import { state } from "./reactivity";

export function prepareStore<Store extends BaseStore>(
  name: string,
  store: Store
): VaxeeInternalStore<Store> {
  const vaxee = useVaxee();

  if (vaxee._stores[name]) {
    return vaxee._stores[name] as VaxeeInternalStore<Store>;
  }

  const { states, actions, getters, requests, other } = parseStore(store);

  if (vaxee.state.value[name]) {
    for (const key in states) {
      states[key].value = vaxee.state.value[name][key];
    }
  }

  const preparedQueries = {} as Record<string, VaxeeRequest<any>>;

  for (const key in requests) {
    checkPrivateRequest(requests[key]);

    const request = requests[key]._init(name, key);

    states[key] = state({
      data: request.data,
      status: request.status,
    });

    preparedQueries[key] = request;
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
