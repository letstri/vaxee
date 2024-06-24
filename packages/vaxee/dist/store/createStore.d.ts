import { type Ref, type ToRefs } from "vue";
import type { VaxeeStoreState, VaxeeStoreActions, VaxeeStoreGetters } from "../helpers";
export type BaseStore = Record<string | number | symbol, any>;
type BaseGetter<State> = (state: State) => any;
type BaseGetterSetter<State, Value> = {
    get: (state: State) => Value;
    set: (state: State, value: Value) => void;
};
export type VaxeeStore<Store extends BaseStore, Refs extends boolean = true> = (Refs extends true ? ToRefs<VaxeeStoreState<Store>> : VaxeeStoreState<Store>) & VaxeeStoreActions<Store> & (Refs extends true ? ToRefs<VaxeeStoreGetters<Store>> : VaxeeStoreGetters<Store>) & {
    _state: VaxeeStoreState<Store>;
    _initialState: Record<string | number | symbol, any>;
    _actions: VaxeeStoreActions<Store>;
    _getters: VaxeeStoreGetters<Store>;
    reset: () => void;
};
type RefIfNot<T> = T extends Ref ? T : Ref<T>;
interface UseVaxeeStore<Name extends string, Store extends BaseStore> {
    (): VaxeeStore<Store>;
    <R extends boolean>(refs: R): R extends true ? VaxeeStore<Store> : VaxeeStore<Store, false>;
    <Getter extends BaseGetter<VaxeeStore<Store, false>>>(getter: Getter): ReturnType<Getter> extends Function ? ReturnType<Getter> : RefIfNot<ReturnType<Getter>>;
    <Value extends any>(getterSetter: BaseGetterSetter<VaxeeStoreState<Store>, Value>): RefIfNot<Value>;
    <Name extends keyof VaxeeStore<Store>>(name: Name): VaxeeStore<Store, false>[Name] extends Function ? VaxeeStore<Store, false>[Name] : RefIfNot<VaxeeStore<Store, false>[Name]>;
    _store: Name;
    storeType: Store;
}
export declare const createStore: <Name extends string, Store extends BaseStore>(name: Name, store: Store & ThisType<VaxeeStoreState<Store>>) => UseVaxeeStore<Name, Store>;
export {};
