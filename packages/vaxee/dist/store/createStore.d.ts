import { type ToRefs, type UnwrapNestedRefs } from "vue";
import type { VaxeeStoreState, VaxeeStoreActions, VaxeeStoreGetters, VaxeeStoreOther, VaxeeStoreQueries } from "./types";
import { getter, state } from "./reactivity";
import { request } from "./request";
import type { ToComputedRefs } from "../types";
export type BaseStore = Record<string, any>;
export type VaxeeStore<Store extends BaseStore> = ToRefs<VaxeeStoreState<Store>> & ToComputedRefs<VaxeeStoreGetters<Store>> & VaxeeStoreQueries<Store> & VaxeeStoreActions<Store> & VaxeeStoreOther<Store>;
export type VaxeeReactiveStore<Store extends BaseStore> = VaxeeStoreState<Store> & VaxeeStoreGetters<Store> & UnwrapNestedRefs<VaxeeStoreQueries<Store>> & VaxeeStoreActions<Store> & VaxeeStoreOther<Store>;
interface UseVaxeeStore<Store extends BaseStore> {
    (): VaxeeStore<Store>;
    <Name extends keyof VaxeeStore<Store>>(name: Name): VaxeeStore<Store>[Name];
    $inferState: VaxeeStoreState<Store>;
    reactive: () => VaxeeReactiveStore<Store>;
}
export declare const createStore: <Store extends BaseStore>(name: string, store: (options: {
    state: typeof state;
    getter: typeof getter;
    /**
     * @deprecated Use `request` instead.
     */
    query: typeof request;
    request: typeof request;
}) => Store) => UseVaxeeStore<Store>;
export {};
