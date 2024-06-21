import {
  computed,
  hasInjectionContext,
  inject,
  reactive,
  toRef,
  toRefs,
  type Ref,
  type ToRefs,
} from "vue";
import { getVaxeeInstance, vaxeeSymbol, type Vaxee } from "../plugin";
import type {
  FunctionProperties,
  NonFunctionProperties,
} from "../models/helpers";
import { IS_DEV } from "../constants";
import { prepareStore } from "./prepareStore";

// function isComputed<T>(
//   value: ComputedRef<T> | unknown
// ): value is ComputedRef<T> {
//   return !!(isRef(value) && (value as any)?.effect);
// }

export type BaseStore = Record<string | number | symbol, unknown>;
type BaseGetter<Store extends BaseStore> = (state: Store) => any;
type BaseGetterSetter<
  State extends NonFunctionProperties<BaseStore>,
  Value extends any
> = {
  get: (state: State) => Value;
  set: (state: State, value: Value) => void;
};

export type VaxeeStore<
  State,
  Actions,
  Refs extends boolean = false
> = (Refs extends true ? ToRefs<State> : State) &
  Actions & {
    $state: State;
    $actions: Actions;
    $reset: () => void;
  };

export interface UseVaxeeStore<
  Store extends BaseStore,
  State extends NonFunctionProperties<Store>,
  Actions extends FunctionProperties<Store>
> {
  (): VaxeeStore<State, Actions>;
  <R extends boolean>(refs: R): R extends true
    ? VaxeeStore<State, Actions, true>
    : VaxeeStore<State, Actions>;
  <Getter extends BaseGetter<VaxeeStore<State, Actions>>>(
    getter: Getter
  ): ReturnType<Getter> extends (...args: any) => any
    ? ReturnType<Getter>
    : Ref<ReturnType<Getter>>;
  <Value extends any>(getterSetter: BaseGetterSetter<State, Value>): Ref<Value>;
  <Name extends keyof VaxeeStore<State, Actions>>(name: Name): VaxeeStore<
    State,
    Actions
  >[Name] extends (...args: any) => any
    ? VaxeeStore<State, Actions>[Name]
    : Ref<VaxeeStore<State, Actions>[Name]>;
}

export function defineStore<
  Store extends BaseStore,
  State extends NonFunctionProperties<Store>,
  Actions extends FunctionProperties<Store>
>(name: string, store: () => Store): UseVaxeeStore<Store, State, Actions> {
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
    const hasContext = hasInjectionContext();
    const vaxee = hasContext ? inject<Vaxee>(vaxeeSymbol) : getVaxeeInstance();

    if (!vaxee) {
      throw new Error(
        "[🌱 vaxee]: Seems like you forgot to install the plugin"
      );
    }

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

    prepareStore(store, name);

    const _state = vaxee.state.value[name] as State;
    const _store = vaxee._stores[name] as VaxeeStore<State, Actions, true>;

    if (getter) {
      const _getter = toRef(() => getter(reactive(_store) as Store));

      return typeof _getter.value === "function"
        ? _getter.value.bind(_store)
        : _getter;
    }

    if (getterSetter) {
      return computed({
        get: () => getterSetter.get(_store.$state),
        set: (value: Value) => getterSetter.set(_store.$state, value),
      });
    }

    if (propName) {
      // @ts-ignore
      if (typeof _store[propName] === "function") {
        // @ts-ignore
        return (_store[propName] as () => {}).bind(_store);
      }

      return computed({
        get: () => _state[propName as keyof State],
        set: (value) => {
          _state[propName as keyof State] = value;
        },
      });
    }

    if (refs) {
      return _store;
    }

    return reactive(_store);
  }

  return useStore;
}
