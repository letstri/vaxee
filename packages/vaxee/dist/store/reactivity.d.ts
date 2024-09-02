import { type ComputedRef, type Ref } from "vue";
declare const getterSymbol: unique symbol;
export type VaxeeState<T> = Ref<T>;
interface VaxeeStateOptions<T> {
    /**
     * If `true`, the state will be shallow and will not be reactive to deep changes.
     */
    shallow?: boolean;
    /**
     * If a string, the state will be persisted with the given key.
     * If an object, the object must have `get` and `set` methods. The `get` method should return the persisted value and the `set` method should set the persisted value.
     */
    persist?: string | {
        get: () => any;
        set: (value: T) => any;
    };
}
export declare function state<T = any>(): VaxeeState<T | undefined>;
export declare function state<T>(value: T, options?: VaxeeStateOptions<T>): VaxeeState<T>;
export declare const isState: (ref: any) => ref is VaxeeState<any>;
export type VaxeeGetter<T> = ComputedRef<T>;
export type VaxeePrivateGetter<T> = VaxeeGetter<T> & {
    GetterSymbol: typeof getterSymbol;
};
export declare function getter<T>(fn: () => T): VaxeeGetter<T>;
export declare const isGetter: (ref: any) => ref is VaxeeGetter<any>;
export {};
