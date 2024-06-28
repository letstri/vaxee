import { computed, customRef, type ComputedRef, type Ref, ref } from "vue";

const stateSymbol = Symbol("vaxee-state");
const getterSymbol = Symbol("vaxee-getter");

export type VaxeeState<T> = Ref<T> & {
  _vaxee: typeof stateSymbol;
};

export const state = <T>(value: T): VaxeeState<T> => {
  const _ref = ref(value);

  // @ts-expect-error
  _ref._vaxee = stateSymbol;

  return _ref as VaxeeState<T>;
};

export const isState = (ref: any): ref is VaxeeState<any> =>
  ref?._vaxee === stateSymbol;

export type VaxeeGetter<T> = ComputedRef<T> & {
  _vaxee: typeof getterSymbol;
};

export const getter = <T>(fn: () => T): VaxeeGetter<T> => {
  const ref = computed(() => fn());

  // @ts-expect-error
  ref._vaxee = getterSymbol;

  return ref as VaxeeGetter<T>;
};

export const isGetter = (ref: any): ref is VaxeeGetter<any> =>
  ref?._vaxee === getterSymbol;
