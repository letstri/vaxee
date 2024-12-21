import { type Ref, type WatchSource } from "vue";
declare const requestSymbol: unique symbol;
export declare enum VaxeeRequestStatus {
    Idle = "idle",
    Fetching = "fetching",
    Refreshing = "refreshing",
    Error = "error",
    Success = "success"
}
export interface VaxeeRequest<T, P extends any = void> {
    data: Ref<T | null>;
    error: Ref<Error | null>;
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
    execute: (params: P) => Promise<void>;
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
interface VaxeePrivateRequest<T, P extends any = void> extends VaxeeRequest<T, P> {
    RequestSymbol: typeof requestSymbol;
    _init(store: string, key: string): VaxeeRequest<T, P>;
}
export declare function checkPrivateRequest(request: any): asserts request is VaxeePrivateRequest<any, any>;
export interface VaxeeRequestParams<P extends any = void> {
    /**
     * The signal to use for the request.
     */
    signal: AbortSignal;
    /**
     * The param to use for the request.
     */
    param: P;
}
interface VaxeeRequestOptions {
    /**
     * The mode of the request.
     *
     * @default 'auto'
     */
    mode?: "auto" | "manual" | "client";
    /**
     * @deprecated use `mode: 'client'` instead
     */
    sendOnServer?: boolean;
    /**
     * @deprecated use `mode: 'manual'` instead
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
export declare function request<T, P extends any = void>(callback: (params: VaxeeRequestParams<P>) => T | Promise<T>, options?: VaxeeRequestOptions): VaxeeRequest<T, P>;
export declare const isRequest: (request: any) => request is VaxeeRequest<any, any>;
export {};
