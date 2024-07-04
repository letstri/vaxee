import {
  computed,
  reactive,
  type ComputedRef,
  type Ref,
  type ToRefs,
} from "vue";
import { getVaxeeInstance } from "../plugin";
import type {
  VaxeeStoreState,
  VaxeeStoreActions,
  VaxeeStoreGetters,
  VaxeeStoreOther,
} from "../helpers";
import { IS_DEV, VAXEE_LOG_START } from "../constants";
import { prepareStore } from "./prepareStore";
import { getter, state } from "./reactivity";

export type BaseStore = Record<string, any>;

type ToComputed<T> = T extends Ref ? T : ComputedRef<T>;
type ToComputedRefs<T> = {
  [K in keyof T]: ToComputed<T[K]>;
};

export type VaxeeStore<Store extends BaseStore, Refs extends boolean = true> = {
  _state: VaxeeStoreState<Store>;
  _actions: VaxeeStoreActions<Store>;
  _getters: VaxeeStoreGetters<Store>;
  _other: VaxeeStoreOther<Store>;
} & (Refs extends true
  ? ToRefs<VaxeeStoreState<Store>> & ToComputedRefs<VaxeeStoreGetters<Store>>
  : VaxeeStoreState<Store> & VaxeeStoreGetters<Store>) &
  VaxeeStoreActions<Store> &
  VaxeeStoreOther<Store>;

interface UseVaxeeStore<Store extends BaseStore> {
  (): VaxeeStore<Store>;
  <R extends boolean>(refs: R): R extends true
    ? VaxeeStore<Store>
    : VaxeeStore<Store, false>;
  <Name extends keyof VaxeeStore<Store>>(name: Name): VaxeeStore<Store>[Name];
  $inferState: VaxeeStoreState<Store>;
}

export const createStore = <Store extends BaseStore>(
  name: string,
  store: (options: { state: typeof state; getter: typeof getter }) => Store
): UseVaxeeStore<Store> => {
  type State = VaxeeStoreState<Store>;
  type Actions = VaxeeStoreActions<Store>;
  type Getters = VaxeeStoreGetters<Store>;
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

  function use(nameOrToRefs?: keyof VaxeeStore<Store> | boolean) {
    const propName =
      typeof nameOrToRefs === "string"
        ? (nameOrToRefs as keyof Store)
        : undefined;
    const refs = nameOrToRefs === true || nameOrToRefs === undefined;

    const _store = prepareStore(name, store({ state, getter }));

    if (propName) {
      if (_store._actions[propName as keyof Actions]) {
        return _store._actions[propName as keyof Actions];
      }

      if (_store._getters[propName as keyof Getters]) {
        return _store._getters[propName as keyof Getters];
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

    if (refs) {
      return _store;
    }

    return reactive(_store);
  }

  use.$inferState = {} as State;

  return use;
};
