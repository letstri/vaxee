import { type ComputedRef, type Ref, type ToRefs } from "vue";
import type { VaxeeStoreState, VaxeeStoreActions, VaxeeStoreGetters, VaxeeStoreOther } from "../helpers";
import { getter, state } from "./reactivity";
export type BaseStore = Record<string, any>;
type ToComputed<T> = T extends Ref ? T : ComputedRef<T>;
type ToComputedRefs<T> = {
    [K in keyof T]: ToComputed<T[K]>;
};
export type VaxeeStore<Store extends BaseStore, Refs extends boolean = true> = {
    _state: VaxeeStoreState<Store>;
    _actions: VaxeeStoreActions<Store>;
    _getters: VaxeeStoreGetters<Store>;
    _other: VaxeeStoreOther<Store>;
} & (Refs extends true ? ToRefs<VaxeeStoreState<Store>> & ToComputedRefs<VaxeeStoreGetters<Store>> : VaxeeStoreState<Store> & VaxeeStoreGetters<Store>) & VaxeeStoreActions<Store> & VaxeeStoreOther<Store>;
interface UseVaxeeStore<Store extends BaseStore> {
    (): VaxeeStore<Store>;
    <R extends boolean>(refs: R): R extends true ? VaxeeStore<Store> : VaxeeStore<Store, false>;
    <Name extends keyof VaxeeStore<Store>>(name: Name): VaxeeStore<Store>[Name];
    $stateInfer: VaxeeStoreState<Store>;
}
export declare const createStore: <Store extends BaseStore>(name: string, store: (options: {
    state: typeof state;
    getter: typeof getter;
}) => Store) => UseVaxeeStore<Store>;
export {};
