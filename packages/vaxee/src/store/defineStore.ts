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
import { IS_DEV } from "../constants";
import { prepareStore } from "./prepareStore";

// function isComputed<T>(
//   value: ComputedRef<T> | unknown
// ): value is ComputedRef<T> {
//   return !!(isRef(value) && (value as any)?.effect);
// }

export type BaseStore = Record<string | number | symbol, any>;
type BaseGetter<Store extends BaseStore> = (state: Store) => any;
type BaseGetterSetter<State, Value> = {
  get: (state: State) => Value;
  set: (state: State, value: Value) => void;
};

export type VaxeeStore<
  State extends VaxeeStoreState<any>,
  Actions extends VaxeeStoreActions<any>,
  Refs extends boolean = true
> = (Refs extends true ? ToRefs<State> : State) &
  Actions & {
    $state: State;
    $actions: Actions;
    $reset: () => void;
  };

export interface UseVaxeeStore<
  State extends VaxeeStoreState<any>,
  Actions extends VaxeeStoreActions<any>
> {
  (): VaxeeStore<State, Actions, false>;
  <R extends boolean>(refs: R): R extends true
    ? VaxeeStore<State, Actions>
    : VaxeeStore<State, Actions, false>;
  <Getter extends BaseGetter<VaxeeStore<State, Actions, false>>>(
    getter: Getter
  ): ReturnType<Getter> extends (...args: any) => any
    ? ReturnType<Getter>
    : Ref<ReturnType<Getter>>;
  <Value extends any>(getterSetter: BaseGetterSetter<State, Value>): Ref<Value>;
  <Name extends keyof VaxeeStore<State, Actions>>(name: Name): VaxeeStore<
    State,
    Actions,
    false
  >[Name] extends (...args: any) => any
    ? VaxeeStore<State, Actions, false>[Name]
    : Ref<VaxeeStore<State, Actions, false>[Name]>;
  _store: string;
}

type VaxeeStoreFunction = (options: {
  getter<Value>(
    callback: (store: ReturnType<VaxeeStoreFunction>) => Value
  ): ComputedRef<Value>;
}) => BaseStore;

export function defineStore<
  Store extends BaseStore,
  State extends VaxeeStoreState<Store>,
  Actions extends VaxeeStoreActions<Store>
>(name: string, store: () => Store): UseVaxeeStore<State, Actions> {
  if (getVaxeeInstance()?._stores[name]) {
    if (IS_DEV) {
      console.warn(`[🌱 vaxee]: The store with name ${name} already exists.`);
    }
  }

  function useStore<Value extends any>(
    getterOrNameOrToRefs?:
      | BaseGetter<Store>
      | BaseGetterSetter<State, Value>
      | keyof VaxeeStore<State, Actions>
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

      return typeof _getter.value === "function"
        ? _getter.value.bind(_store.$state)
        : _getter;
    }

    if (getterSetter) {
      return computed({
        get: () => getterSetter.get(_store.$state as any),
        set: (value: Value) => getterSetter.set(_store.$state as any, value),
      });
    }

    if (propName) {
      // @ts-ignore
      if (typeof _store[propName] === "function") {
        // @ts-ignore
        return _store[propName].bind(_store.$state);
      }

      return computed({
        get: () => _store.$state[propName as keyof VaxeeStoreState<Store>],
        set: (value) => {
          _store.$state[propName as keyof VaxeeStoreState<Store>] = value;
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
}
