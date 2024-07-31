import { type Ref } from "vue";
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
    suspense: () => Promise<void>;
    execute: () => Promise<void>;
    refresh: () => Promise<void>;
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
     * If `true`, the query will not be automatically fetched when the component is mounted.
     */
    sendManually?: boolean;
}
export declare function query<T>(callback: (params: VaxeeQueryParams) => Promise<T>, options?: VaxeeQueryOptions): VaxeeQuery<T>;
export declare const isQuery: (query: any) => query is VaxeeQuery<any>;
export {};
