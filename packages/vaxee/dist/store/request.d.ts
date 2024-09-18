import { type Ref, type WatchSource } from "vue";
declare const requestSymbol: unique symbol;
export declare enum VaxeeRequestStatus {
    NotFetched = "not-fetched",
    Fetching = "fetching",
    Refreshing = "refreshing",
    Error = "error",
    Success = "success"
}
export interface VaxeeRequest<T> {
    data: Ref<null | T>;
    error: Ref<null | Error>;
    status: Ref<VaxeeRequestStatus>;
    /**
     * `suspense` gives ability to wait promise resolve without refreshing the data.
     *
     * @returns A promise that resolves when the request is done.
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
     * `execute` will fetch the request and clear the data and the error.
     *
     * @returns A promise that resolves when the request is done.
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
     * `refresh` will fetch the request without clearing the data and the error.
     *
     * @returns A promise that resolves when the request is done.
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
interface VaxeePrivateRequest<T> extends VaxeeRequest<T> {
    RequestSymbol: typeof requestSymbol;
    _init(store: string, key: string): VaxeeRequest<T>;
}
export declare function checkPrivateRequest(request: any): asserts request is VaxeePrivateRequest<any>;
interface VaxeeRequestParams {
    /**
     * The signal to use for the request.
     */
    signal: AbortSignal;
}
interface VaxeeRequestOptions {
    /**
     * If `false`, the request will not be automatically fetched on the server side. Default `true`.
     */
    sendOnServer?: boolean;
    /**
     * If `true`, the request will not be automatically fetched on both client and server. Default `false`.
     */
    sendManually?: boolean;
    /**
     * An array of refs that will be watched to trigger a request `refresh` function.
     */
    watch?: WatchSource[];
    /**
     * A callback that will be called when an error occurs during the request.
     */
    onError?: <E = unknown>(error: E) => any;
}
export declare function request<T>(callback: (params: VaxeeRequestParams) => T | Promise<T>, options?: VaxeeRequestOptions): VaxeeRequest<T>;
export declare const isRequest: (request: any) => request is VaxeeRequest<any>;
export {};
