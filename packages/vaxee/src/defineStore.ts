import {
  computed,
  isRef,
  reactive,
  toRaw,
  toRef,
  toRefs,
  unref,
  type ComputedRef,
  type Ref,
  type ToRefs,
} from "vue";
import { getVaxeeInstance } from "./plugin";
import type {
  FunctionProperties,
  NonFunctionProperties,
} from "./models/helpers";

function isComputed<T>(
  value: ComputedRef<T> | unknown
): value is ComputedRef<T> {
  return !!(isRef(value) && (value as any)?.effect);
}

export type BaseStore = Record<string | number | symbol, unknown>;
type BaseGetter<Store extends BaseStore> = (state: Store) => any;
type BaseGetterSetter<
  State extends NonFunctionProperties<BaseStore>,
  Value extends any
> = {
  get: (state: State) => Value;
  set: (state: State, value: Value) => void;
};

export interface UseVaxeeStore<
  Store extends BaseStore,
  State extends NonFunctionProperties<Store>,
  Actions extends FunctionProperties<Store>
> {
  (): Store;
  <R extends boolean>(refs: R): R extends true
    ? ToRefs<State> & Actions
    : Store;
  <Getter extends BaseGetter<Store>>(
    getter: Getter
  ): ReturnType<Getter> extends (...args: any) => any
    ? ReturnType<Getter>
    : Ref<ReturnType<Getter>>;
  <Value extends any>(getterSetter: BaseGetterSetter<State, Value>): Ref<Value>;
  <Name extends keyof Store>(name: Name): Store[Name] extends (
    ...args: any
  ) => any
    ? Store[Name]
    : Ref<Store[Name]>;
}

export function defineStore<
  Store extends BaseStore,
  State extends NonFunctionProperties<Store>,
  Actions extends FunctionProperties<Store>
>(name: string, store: () => Store): UseVaxeeStore<Store, State, Actions> {
  const vaxee = getVaxeeInstance();

  if (vaxee?._stores[name]) {
    console.log(
      `[🌱 vaxee]: Store with name "${name}" already exists. Reusing..`
    );
    return vaxee._stores[name];
  }

  function useStore<Value extends any>(
    getterOrNameOrToRefs?:
      | BaseGetter<Store>
      | BaseGetterSetter<State, Value>
      | keyof Store
      | boolean
  ) {
    const vaxee = getVaxeeInstance();

    if (!vaxee) {
      throw new Error(
        "[🌱 vaxee]: Seems like you forgot to install the plugin"
      );
    }

    const initialStore = store();
    const { initialState, actions } = Object.entries(initialStore).reduce(
      (acc, [key, value]) => {
        if (typeof value === "function") {
          acc.actions[key as keyof Actions] = value.bind(
            vaxee.state.value[name]
          );
        } else {
          acc.initialState[key as keyof State] = value as State[keyof State];
        }
        return acc;
      },
      {
        initialState: {} as State,
        actions: {} as Actions,
      }
    );

    vaxee.state.value[name] ||= initialState;
    vaxee._actions[name] ||= actions;

    const _state = vaxee.state.value[name] as State;
    const _stateAndActions = { ...toRefs(_state), ...actions };

    const getter =
      typeof getterOrNameOrToRefs === "function"
        ? getterOrNameOrToRefs
        : undefined;
    const getterSetter =
      typeof getterOrNameOrToRefs === "object"
        ? getterOrNameOrToRefs
        : undefined;
    const propName =
      typeof getterOrNameOrToRefs === "string"
        ? (getterOrNameOrToRefs as keyof Store)
        : undefined;
    const refs = getterOrNameOrToRefs === true;

    if (getter) {
      const _getter = toRef(() => getter(reactive(_stateAndActions) as Store));

      return typeof _getter.value === "function"
        ? unref(_getter).bind(_state)
        : _getter;
    }

    if (getterSetter) {
      return computed({
        get: () => getterSetter.get(_state),
        set: (value: Value) => getterSetter.set(_state, value),
      });
    }

    if (propName) {
      // @ts-ignore
      if (typeof _state[propName] === "function") {
        // @ts-ignore
        return (_state[propName] as () => {}).bind(_state);
      }

      return computed({
        // @ts-ignore
        get: () => _state[propName],
        set: (value) => {
          // @ts-ignore
          _state[propName] = value;
        },
      });
    }

    if (refs) {
      return _stateAndActions;
    }

    vaxee._stores[name] = useStore;

    return reactive(_stateAndActions);
  }

  return useStore;
}

// const useUsersStore = defineStore("users", () => ({
//   count2: {
//     users2: 10,
//   },
//   increment() {
//     this.count2.users2++;
//   },
// }));

// const { count2 } = useUsersStore(true);
// count2.value.users2; // 10
// const usersStore2 = useUsersStore();
// usersStore2.count2.users2; // 10
// const users2 = useUsersStore({
//   get: (state) => state.count2.users2,
//   set: (state, value) => {
//     state.count2.users2 = value;
//   },
// });
// users2.value; // 10
// const count22 = useUsersStore("count2");
// count22.value; // 10
