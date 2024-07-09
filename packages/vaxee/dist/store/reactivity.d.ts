import { type ComputedRef, type Ref } from "vue";
declare const stateSymbol: unique symbol;
declare const getterSymbol: unique symbol;
export type VaxeeState<T> = Ref<T> & {
    _vaxee: typeof stateSymbol;
    _options: VaxeeStateOptions;
};
interface VaxeeStateOptions {
    shallow?: boolean;
    persist?: boolean | {
        get: (key: string) => any;
        set: (key: string, value: any) => any;
    };
}
export declare function state<T = any>(): VaxeeState<T | undefined>;
export declare function state<T>(value: T, options?: VaxeeStateOptions): VaxeeState<T>;
export declare const isState: (ref: any) => ref is VaxeeState<any>;
export type VaxeeGetter<T> = ComputedRef<T> & {
    _vaxee: typeof getterSymbol;
};
export declare function getter<T>(fn: () => T): VaxeeGetter<T>;
export declare const isGetter: (ref: any) => ref is VaxeeGetter<any>;
export {};
