import type { ComputedRef, Ref } from "vue";
export type ReturnTypes<T extends Record<string, (...args: any) => any>> = {
    [K in keyof T]: ReturnType<T[K]>;
};
export type ToComputed<T> = T extends Ref ? T : ComputedRef<T>;
export type ToComputedRefs<T> = {
    [K in keyof T]: ToComputed<T[K]>;
};
