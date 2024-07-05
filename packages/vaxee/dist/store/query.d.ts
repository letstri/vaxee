import { type VaxeeState } from "./reactivity";
declare const querySymbol: unique symbol;
export type VaxeeQueryState<T> = (VaxeeState<{
    data: null;
    error: null;
    status: "pending";
}> | VaxeeState<{
    data: null;
    error: Error;
    status: "error";
}> | VaxeeState<{
    data: T;
    error: null;
    status: "success";
}>) & {
    suspense: () => Promise<void>;
    refresh: () => Promise<void>;
    execute: () => Promise<void>;
};
type VaxeeQueryOptions<T> = {
    initial?: {
        data: T;
        error: Error;
        status: "pending" | "error" | "success";
    };
};
export type VaxeeQuery<T> = {
    (options?: VaxeeQueryOptions<T>): VaxeeQueryState<T>;
    _vaxee: typeof querySymbol;
};
export declare function query<T>(callback: () => Promise<T>): VaxeeQuery<T>;
export declare const isQuery: (query: any) => query is VaxeeQuery<any>;
export {};
