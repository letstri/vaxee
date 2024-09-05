import { type Ref, type WatchSource } from "vue";
declare const querySymbol: unique symbol;
export declare enum VaxeeQueryStatus {
    NotFetched = "not-fetched",
    Fetching = "fetching",
    Refreshing = "refreshing",
    Error = "error",
    Success = "success"
}
export interface VaxeeQuery<T> {
    data: Ref<null | T>;
    error: Ref<null | Error>;
    status: Ref<VaxeeQueryStatus>;
    /**
     * `suspense` gives ability to wait promise resolve without refreshing the data.
     *
     * @returns A promise that resolves when the query is done.
     *
     * @example
     *
     * ```ts
     * const { suspense } = useStore('products');
     *
     * await suspense();
     * ```
     */
    suspense: () => Promise<void>;
    /**
     * `execute` will fetch the query and clear the data and the error.
     *
     * @returns A promise that resolves when the query is done.
     *
     * @example
     *
     * ```ts
     * const { execute } = useStore('products');
     *
     * await execute();
     * ```
     */
    execute: () => Promise<void>;
    /**
     * `refresh` will fetch the query without clearing the data and the error.
     *
     * @returns A promise that resolves when the query is done.
     *
     * @example
     *
     * ```ts
     * const { refresh } = useStore('products');
     *
     * await refresh();
     * ```
     */
    refresh: () => Promise<void>;
    onError: <E = unknown>(callback: (error: E) => any) => any;
    onSuccess: (callback: (data: T) => any) => any;
}
interface VaxeePrivateQuery<T> extends VaxeeQuery<T> {
    QuerySymbol: typeof querySymbol;
    _init(store: string, key: string): VaxeeQuery<T>;
}
export declare function checkPrivateQuery(query: any): asserts query is VaxeePrivateQuery<any>;
interface VaxeeQueryParams {
    /**
     * The signal to use for the query.
     */
    signal: AbortSignal;
}
interface VaxeeQueryOptions {
    /**
     * If `false`, the query will not be automatically fetched on the server side. Default `true`.
     */
    sendOnServer?: boolean;
    /**
     * If `true`, the query will not be automatically fetched on both client and server. Default `false`.
     */
    sendManually?: boolean;
    /**
     * An array of refs that will be watched to trigger a query `refresh` function.
     */
    watch?: WatchSource[];
    /**
     * A callback that will be called when an error occurs during the query.
     */
    onError?: <E = unknown>(error: E) => any;
}
export declare function query<T>(callback: (params: VaxeeQueryParams) => T | Promise<T>, options?: VaxeeQueryOptions): VaxeeQuery<T>;
export declare const isQuery: (query: any) => query is VaxeeQuery<any>;
export {};
