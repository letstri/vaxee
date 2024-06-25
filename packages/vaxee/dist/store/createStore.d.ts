import { type ComputedRef, type Ref, type ToRef, type ToRefs } from "vue";
import type { VaxeeStoreState, VaxeeStoreActions, VaxeeStoreGetters } from "../helpers";
export type BaseStore = {
    [key: string | number | symbol]: any;
};
type BaseGetter<State> = (state: State) => any;
type BaseGetterSetter<State, Value> = {
    get: (state: State) => Value;
    set: (state: State, value: Value) => void;
};
type ToComputed<T> = T extends Ref ? T : ComputedRef<T>;
type ToComputedRefs<T> = {
    [K in keyof T]: ToComputed<T[K]>;
};
export type VaxeeStore<Store extends BaseStore, Refs extends boolean = true> = (Refs extends true ? ToRefs<VaxeeStoreState<Store>> : VaxeeStoreState<Store>) & VaxeeStoreActions<Store> & (Refs extends true ? ToComputedRefs<VaxeeStoreGetters<Store>> : VaxeeStoreGetters<Store>) & {
    _state: VaxeeStoreState<Store>;
    _actions: VaxeeStoreActions<Store>;
    _getters: VaxeeStoreGetters<Store>;
    reset: () => void;
};
interface UseVaxeeStore<Name extends string, Store extends BaseStore> {
    (): VaxeeStore<Store>;
    <R extends boolean>(refs: R): R extends true ? VaxeeStore<Store> : VaxeeStore<Store, false>;
    <Getter extends BaseGetter<VaxeeStore<Store, false>>>(getter: Getter): ReturnType<Getter> extends Function ? ReturnType<Getter> : ToComputed<ReturnType<Getter>>;
    <Value extends any>(getterSetter: BaseGetterSetter<VaxeeStoreState<Store>, Value>): ToRef<Value>;
    <Name extends keyof VaxeeStore<Store>>(name: Name): VaxeeStore<Store>[Name];
    _store: Name;
    storeType: Store;
}
export declare const createStore: <Store extends BaseStore, Name extends string = string>(name: Name, store: Store & ThisType<VaxeeStoreState<Store> & VaxeeStoreGetters<Store> & Pick<VaxeeStore<Store>, "reset">>) => UseVaxeeStore<Name, Store>;
export {};
