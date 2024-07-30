import {
  computed,
  type ComputedRef,
  type Ref,
  ref,
  shallowRef,
  watch,
} from "vue";
import { useVaxee } from "../composables/useVaxee";
import { IS_CLIENT } from "../constants";

const stateSymbol = Symbol("vaxee-state");
const getterSymbol = Symbol("vaxee-getter");

export type VaxeeState<T> = Ref<T> & {
  StateSymbol: typeof stateSymbol;
  _persist: null | {
    get: () => any;
    set: (value: any) => any;
  };
};

interface VaxeeStateOptions {
  /**
   * If `true`, the state will be shallow and will not be reactive to deep changes.
   */
  shallow?: boolean;
  /**
   * If a string, the state will be persisted with the given key.
   * If an object, the object must have `get` and `set` methods. The `get` method should return the persisted value and the `set` method should set the persisted value.
   */
  persist?:
    | string
    | {
        get: () => any;
        set: (value: any) => any;
      };
}

function getDefaultPersist() {
  const vaxee = useVaxee();

  return {
    get: (key: string) => {
      if (vaxee._options.persist) {
        return vaxee._options.persist.get(key);
      }

      return IS_CLIENT ? JSON.parse(localStorage.getItem(key) || "null") : null;
    },
    set: (key: string, value: any) => {
      if (vaxee._options.persist) {
        vaxee._options.persist?.set(key, value);
      } else if (IS_CLIENT) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },
  };
}

export function state<T = any>(): VaxeeState<T | undefined>;
export function state<T>(value: T, options?: VaxeeStateOptions): VaxeeState<T>;
export function state<T>(
  value?: T,
  options?: VaxeeStateOptions
): VaxeeState<T> {
  const _ref = (
    options?.shallow ? shallowRef(value) : ref(value)
  ) as VaxeeState<T>;

  _ref.StateSymbol = stateSymbol;

  if (
    typeof options?.persist === "object" &&
    "get" in options.persist &&
    "set" in options.persist
  ) {
    _ref._persist = options.persist;
  } else if (typeof options?.persist === "string") {
    const { get: _get, set: _set } = getDefaultPersist();

    _ref._persist = {
      get: () => _get(options.persist as string),
      set: (value) => _set(options.persist as string, value),
    };
  } else {
    _ref._persist = null;
  }

  if (_ref._persist) {
    const persisted = _ref._persist.get();

    if (persisted !== null && persisted !== undefined) _ref.value = persisted;

    watch(
      _ref,
      (value) => {
        _ref._persist!.set(value);
      },
      { deep: true }
    );
  }

  return _ref;
}

export const isState = (ref: any): ref is VaxeeState<any> =>
  ref?.StateSymbol === stateSymbol;

export type VaxeeGetter<T> = ComputedRef<T> & {
  GetterSymbol: typeof getterSymbol;
};

export function getter<T>(fn: () => T): VaxeeGetter<T> {
  const ref = computed(() => fn()) as VaxeeGetter<T>;

  ref.GetterSymbol = getterSymbol;

  return ref as VaxeeGetter<T>;
}

export const isGetter = (ref: any): ref is VaxeeGetter<any> =>
  ref?.GetterSymbol === getterSymbol;
