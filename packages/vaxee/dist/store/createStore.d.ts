import { type ToRefs, type UnwrapNestedRefs } from "vue";
import type { VaxeeStoreState, VaxeeStoreActions, VaxeeStoreGetters, VaxeeStoreOther, VaxeeStoreQueries } from "./types";
import { getter, state } from "./reactivity";
import { query } from "./query";
import type { ToComputedRefs } from "../types";
export type BaseStore = Record<string, any>;
export type VaxeeStore<Store extends BaseStore, Refs extends boolean = true> = (Refs extends true ? ToRefs<VaxeeStoreState<Store>> & ToComputedRefs<VaxeeStoreGetters<Store>> & VaxeeStoreQueries<Store> : VaxeeStoreState<Store> & VaxeeStoreGetters<Store> & UnwrapNestedRefs<VaxeeStoreQueries<Store>>) & VaxeeStoreActions<Store> & VaxeeStoreOther<Store>;
interface UseVaxeeStore<Store extends BaseStore> {
    (): VaxeeStore<Store>;
    <Name extends keyof VaxeeStore<Store>>(name: Name): VaxeeStore<Store>[Name];
    $inferState: VaxeeStoreState<Store>;
    reactive: () => VaxeeStore<Store, false>;
}
export declare const createStore: <Store extends BaseStore>(name: string, store: (options: {
    state: typeof state;
    getter: typeof getter;
    query: typeof query;
}) => Store) => UseVaxeeStore<Store>;
export {};
