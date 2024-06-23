import {
  computed,
  reactive,
  toRef,
  type ComputedRef,
  type Ref,
  type ToRefs,
} from "vue";
import { getVaxeeInstance } from "../plugin";
import type { VaxeeStoreState, VaxeeStoreActions } from "../helpers";
import { IS_DEV, VAXEE_LOG_START } from "../constants";
import { prepareStore } from "./prepareStore";

// function isComputed<T>(
//   value: ComputedRef<T> | unknown
// ): value is ComputedRef<T> {
//   return !!(isRef(value) && (value as any)?.effect);
// }

export type BaseStore = Record<string | number | symbol, any>;
type BaseGetter<State> = (state: State) => any;
type BaseGetterSetter<State, Value> = {
  get: (state: State) => Value;
  set: (state: State, value: Value) => void;
};

export type VaxeeStore<
  Store extends BaseStore,
  Refs extends boolean = true
> = (Refs extends true
  ? ToRefs<VaxeeStoreState<Store>>
  : VaxeeStoreState<Store>) &
  VaxeeStoreActions<Store> & {
    $state: VaxeeStoreState<Store>;
    $actions: VaxeeStoreActions<Store>;
    $reset: () => void;
  };

interface UseVaxeeStore<Store extends BaseStore> {
  (): VaxeeStore<Store, false>;
  <R extends boolean>(refs: R): R extends true
    ? VaxeeStore<Store>
    : VaxeeStore<Store, false>;
  <Getter extends BaseGetter<VaxeeStore<Store, false>>>(
    getter: Getter
  ): ReturnType<Getter> extends Function
    ? ReturnType<Getter>
    : Ref<ReturnType<Getter>>;
  <Value extends any>(
    getterSetter: BaseGetterSetter<VaxeeStoreState<Store>, Value>
  ): Ref<Value>;
  <Name extends keyof VaxeeStore<Store>>(name: Name): VaxeeStore<
    Store,
    false
  >[Name] extends Function
    ? VaxeeStore<Store, false>[Name]
    : Ref<VaxeeStore<Store, false>[Name]>;
  _store: string;
}
type CreateVaxeeStore = <Store extends BaseStore>(
  name: string,
  store: () => Store
) => UseVaxeeStore<Store>;

export const createStore: CreateVaxeeStore = (name, store) => {
  type Store = ReturnType<typeof store>;
  type State = VaxeeStoreState<Store>;
  type Actions = VaxeeStoreActions<Store>;

  if (getVaxeeInstance()?._stores[name]) {
    if (IS_DEV) {
      console.warn(
        VAXEE_LOG_START + `The store with name ${name} already exists.`
      );
    }
  }

  function useStore<Value extends any>(
    getterOrNameOrToRefs?:
      | BaseGetter<State>
      | BaseGetterSetter<State, Value>
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
    const refs = getterOrNameOrToRefs === true;

    const _store = prepareStore(store, name);

    if (getter) {
      const _getter = toRef(() => getter(reactive(_store) as Store));

      return typeof _getter.value === "function" ? _getter.value : _getter;
    }

    if (getterSetter) {
      return computed({
        get: () => getterSetter.get(_store.$state as any),
        set: (value: Value) => getterSetter.set(_store.$state as any, value),
      });
    }

    if (propName) {
      if (typeof _store[propName as keyof Actions] === "function") {
        return _store[propName as keyof Actions];
      }

      return computed({
        get: () => _store.$state[propName as keyof State],
        set: (value) => {
          _store.$state[propName as keyof State] = value;
        },
      });
    }

    if (refs) {
      return _store;
    }

    return reactive(_store);
  }

  useStore._store = name;

  return useStore;
};
