import {
  computed,
  reactive,
  type ComputedRef,
  type Ref,
  type ToRef,
  type ToRefs,
} from "vue";
import { getVaxeeInstance } from "../plugin";
import type {
  VaxeeStoreState,
  VaxeeStoreActions,
  VaxeeStoreGetters,
} from "../helpers";
import { IS_DEV, VAXEE_LOG_START } from "../constants";
import { prepareStore } from "./prepareStore";

export type BaseStore = {
  [key: string | number | symbol]: any;
};
type BaseGetter<State> = (state: State) => any;
type BaseGetterSetter<State, Value> = {
  get: (state: State) => Value;
  set: (state: State, value: Value) => void;
};

type ToComputed<T> = T extends Ref ? T : ComputedRef<T>;
type ToComputedRefs<T> = {
  [K in keyof T]: ToComputed<T[K]>;
};

export type VaxeeStore<
  Store extends BaseStore,
  Refs extends boolean = true
> = (Refs extends true
  ? ToRefs<VaxeeStoreState<Store>>
  : VaxeeStoreState<Store>) &
  VaxeeStoreActions<Store> &
  (Refs extends true
    ? ToComputedRefs<VaxeeStoreGetters<Store>>
    : VaxeeStoreGetters<Store>) & {
    _state: VaxeeStoreState<Store>;
    _actions: VaxeeStoreActions<Store>;
    _getters: VaxeeStoreGetters<Store>;
    reset: () => void;
  };

interface UseVaxeeStore<Name extends string, Store extends BaseStore> {
  (): VaxeeStore<Store>;
  <R extends boolean>(refs: R): R extends true
    ? VaxeeStore<Store>
    : VaxeeStore<Store, false>;
  <Getter extends BaseGetter<VaxeeStore<Store, false>>>(
    getter: Getter
  ): ReturnType<Getter> extends Function
    ? ReturnType<Getter>
    : ToComputed<ReturnType<Getter>>;
  <Value extends any>(
    getterSetter: BaseGetterSetter<VaxeeStoreState<Store>, Value>
  ): ToRef<Value>;
  <Name extends keyof VaxeeStore<Store>>(name: Name): VaxeeStore<Store>[Name];
  _store: Name;
  storeType: Store;
}

export const createStore = <
  Store extends BaseStore,
  Name extends string = string
>(
  name: Name,
  store: Store &
    ThisType<
      VaxeeStoreState<Store> &
        VaxeeStoreGetters<Store> &
        Pick<VaxeeStore<Store>, "reset">
    >
): UseVaxeeStore<Name, Store> => {
  type State = VaxeeStoreState<Store>;
  type Actions = VaxeeStoreActions<Store>;
  type Getters = VaxeeStoreGetters<Store>;

  if (getVaxeeInstance()?._stores[name]) {
    if (IS_DEV) {
      console.warn(
        VAXEE_LOG_START + `The store with name ${name} already exists.`
      );
    }
  }

  function use(
    getterOrNameOrToRefs?:
      | BaseGetter<State>
      | BaseGetterSetter<State, any>
      | keyof VaxeeStore<Store>
      | boolean
  ) {
    const getter =
      typeof getterOrNameOrToRefs === "function"
        ? getterOrNameOrToRefs
        : undefined;
    const getterSetter =
      typeof getterOrNameOrToRefs === "object" &&
      "get" in getterOrNameOrToRefs &&
      "set" in getterOrNameOrToRefs
        ? getterOrNameOrToRefs
        : undefined;
    const propName =
      typeof getterOrNameOrToRefs === "string"
        ? (getterOrNameOrToRefs as keyof Store)
        : undefined;
    const refs =
      getterOrNameOrToRefs === true || getterOrNameOrToRefs === undefined;

    const _store = prepareStore(store, name);

    if (getter) {
      const _getter = computed(() => getter(reactive(_store) as State));

      return typeof _getter.value === "function" ? _getter.value : _getter;
    }

    if (getterSetter) {
      return computed({
        get: () => getterSetter.get(_store._state),
        set: (value) => getterSetter.set(_store._state, value),
      });
    }

    if (propName) {
      if (_store._actions[propName as keyof Actions]) {
        return _store._actions[propName as keyof Actions];
      }

      if (_store._getters[propName as keyof Getters]) {
        return _store._getters[propName as keyof Getters];
      }

      return computed({
        get: () => _store._state[propName as keyof State],
        set: (value) => {
          _store._state[propName as keyof State] = value;
        },
      });
    }

    if (refs) {
      return _store;
    }

    return reactive(_store);
  }

  use._store = name;
  use.storeType = {} as Store;

  return use;
};
