import { computed, reactive, type ToRefs, type UnwrapNestedRefs } from "vue";
import { getVaxeeInstance } from "../plugin";
import type {
  VaxeeStoreState,
  VaxeeStoreActions,
  VaxeeStoreGetters,
  VaxeeStoreOther,
  VaxeeStoreQueries,
} from "./types";
import { IS_DEV, VAXEE_LOG_START } from "../constants";
import { prepareStore } from "./prepareStore";
import { getter, state } from "./reactivity";
import { query } from "./query";
import type { ToComputedRefs } from "../types";

export type BaseStore = Record<string, any>;

export type VaxeeStore<
  Store extends BaseStore,
  Refs extends boolean = true
> = (Refs extends true
  ? ToRefs<VaxeeStoreState<Store>> &
      ToComputedRefs<VaxeeStoreGetters<Store>> &
      VaxeeStoreQueries<Store>
  : VaxeeStoreState<Store> &
      VaxeeStoreGetters<Store> &
      UnwrapNestedRefs<VaxeeStoreQueries<Store>>) &
  VaxeeStoreActions<Store> &
  VaxeeStoreOther<Store>;

interface UseVaxeeStore<Store extends BaseStore> {
  (): VaxeeStore<Store>;
  <Name extends keyof VaxeeStore<Store>>(name: Name): VaxeeStore<Store>[Name];
  $inferState: VaxeeStoreState<Store>;
  reactive: () => VaxeeStore<Store, false>;
}

export const createStore = <Store extends BaseStore>(
  name: string,
  store: (options: {
    state: typeof state;
    getter: typeof getter;
    query: typeof query;
  }) => Store
): UseVaxeeStore<Store> => {
  type State = VaxeeStoreState<Store>;
  type Actions = VaxeeStoreActions<Store>;
  type Getters = VaxeeStoreGetters<Store>;
  type Queries = VaxeeStoreQueries<Store>;
  type Other = VaxeeStoreOther<Store>;

  if (getVaxeeInstance()?._stores[name]) {
    if (IS_DEV) {
      console.warn(
        VAXEE_LOG_START + `The store with name ${name} already exists.`
      );
    } else {
      throw new Error(
        VAXEE_LOG_START + `The store with name ${name} already exists.`
      );
    }
  }

  function use(propName?: keyof VaxeeStore<Store>) {
    const _store = prepareStore(name, store({ state, getter, query }));

    if (propName) {
      if (_store._actions[propName as keyof Actions]) {
        return _store._actions[propName as keyof Actions];
      }

      if (_store._getters[propName as keyof Getters]) {
        return _store._getters[propName as keyof Getters];
      }

      if (_store._queries[propName as keyof Queries]) {
        return _store._queries[propName as keyof Queries];
      }

      if (_store._other[propName as keyof Other]) {
        return _store._other[propName as keyof Other];
      }

      return computed({
        get: () => _store._state[propName as keyof State],
        set: (value) => {
          _store._state[propName as keyof State] = value;
        },
      }) as any; // TODO: remove any
    }

    return _store;
  }

  use.$inferState = {} as State;
  use.reactive = () => reactive(use());

  return use;
};
