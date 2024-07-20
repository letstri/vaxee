import { type Ref } from "vue";
declare const querySymbol: unique symbol;
export type VaxeeQueryState<T> = {
    data: Ref<null | T>;
    error: Ref<null | Error>;
    status: Ref<"fetching" | "refreshing" | "error" | "success">;
    suspense: () => Promise<void>;
    refresh: () => Promise<void>;
};
type VaxeeQueryOptions<T> = {
    initial?: {
        data: T;
        error: Error;
        status: "fetching" | "refreshing" | "error" | "success";
    };
};
export type VaxeeQuery<T> = {
    (options?: VaxeeQueryOptions<T>): VaxeeQueryState<T>;
    _vaxee: typeof querySymbol;
};
export declare function query<T>(callback: () => Promise<T>): VaxeeQuery<T>;
export declare const isQuery: (query: any) => query is VaxeeQuery<any>;
export {};
