import type { VaxeeState, VaxeeGetter } from "./store/reactivity";
import type { VaxeeQuery } from "./store/query";
import type { ComputedRef, Ref, UnwrapNestedRefs } from "vue";

export type ReturnTypes<T extends Record<string, (...args: any) => any>> = {
  [K in keyof T]: ReturnType<T[K]>;
};

export type ToComputed<T> = T extends Ref ? T : ComputedRef<T>;
export type ToComputedRefs<T> = {
  [K in keyof T]: ToComputed<T[K]>;
};
