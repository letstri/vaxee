import { type Ref } from "vue";
declare const querySymbol: unique symbol;
export declare enum VaxeeQueryStatus {
    NotFetched = "not-fetched",
    Fetching = "fetching",
    Refreshing = "refreshing",
    Error = "error",
    Success = "success"
}
export type VaxeeQueryState<T> = {
    data: Ref<null | T>;
    error: Ref<null | Error>;
    status: Ref<VaxeeQueryStatus>;
    suspense: () => Promise<void>;
    refresh: () => Promise<void>;
};
export type VaxeeQuery<T> = {
    (store: string, key: string): VaxeeQueryState<T>;
    QuerySymbol: typeof querySymbol;
};
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
