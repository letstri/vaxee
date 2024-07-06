import { computed, type ComputedRef, type Ref, ref, shallowRef } from "vue";

const stateSymbol = Symbol("vaxee-state");
const getterSymbol = Symbol("vaxee-getter");

export type VaxeeState<T> = Ref<T> & {
  _vaxee: typeof stateSymbol;
};

interface VaxeeStateOptions {
  shallow: boolean;
}

export function state<T = any>(): VaxeeState<T | undefined>;
export function state<T>(value: T, options?: VaxeeStateOptions): VaxeeState<T>;
export function state<T>(
  value?: T,
  options?: { shallow: boolean }
): VaxeeState<T> {
  const _ref = options?.shallow ? shallowRef(value) : ref(value);

  // @ts-expect-error
  _ref._vaxee = stateSymbol;

  return _ref as VaxeeState<T>;
}

export const isState = (ref: any): ref is VaxeeState<any> =>
  ref?._vaxee === stateSymbol;

export type VaxeeGetter<T> = ComputedRef<T> & {
  _vaxee: typeof getterSymbol;
};

export function getter<T>(fn: () => T): VaxeeGetter<T> {
  const ref = computed(() => fn());

  // @ts-expect-error
  ref._vaxee = getterSymbol;

  return ref as VaxeeGetter<T>;
}

export const isGetter = (ref: any): ref is VaxeeGetter<any> =>
  ref?._vaxee === getterSymbol;
