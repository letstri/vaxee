import { type ComputedRef, type Ref } from "vue";
declare const stateSymbol: unique symbol;
declare const getterSymbol: unique symbol;
export type VaxeeState<T> = Ref<T> & {
    _vaxee: typeof stateSymbol;
};
export declare const state: <T>(value: T) => VaxeeState<T>;
export declare const isState: (ref: any) => ref is VaxeeState<any>;
export type VaxeeGetter<T> = ComputedRef<T> & {
    _vaxee: typeof getterSymbol;
};
export declare const getter: <T>(fn: () => T) => VaxeeGetter<T>;
export declare const isGetter: (ref: any) => ref is VaxeeGetter<any>;
export {};
