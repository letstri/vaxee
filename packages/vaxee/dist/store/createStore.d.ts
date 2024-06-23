import { type Ref, type ToRefs } from "vue";
import type { VaxeeStoreState, VaxeeStoreActions } from "../helpers";
export type BaseStore = Record<string | number | symbol, any>;
type BaseGetter<State> = (state: State) => any;
type BaseGetterSetter<State, Value> = {
    get: (state: State) => Value;
    set: (state: State, value: Value) => void;
};
export type VaxeeStore<Store extends BaseStore, Refs extends boolean = true> = (Refs extends true ? ToRefs<VaxeeStoreState<Store>> : VaxeeStoreState<Store>) & VaxeeStoreActions<Store> & {
    $state: VaxeeStoreState<Store>;
    $actions: VaxeeStoreActions<Store>;
    $reset: () => void;
};
interface UseVaxeeStore<Store extends BaseStore> {
    (): VaxeeStore<Store, false>;
    <R extends boolean>(refs: R): R extends true ? VaxeeStore<Store> : VaxeeStore<Store, false>;
    <Getter extends BaseGetter<VaxeeStore<Store, false>>>(getter: Getter): ReturnType<Getter> extends Function ? ReturnType<Getter> : Ref<ReturnType<Getter>>;
    <Value extends any>(getterSetter: BaseGetterSetter<VaxeeStoreState<Store>, Value>): Ref<Value>;
    <Name extends keyof VaxeeStore<Store>>(name: Name): VaxeeStore<Store, false>[Name] extends Function ? VaxeeStore<Store, false>[Name] : Ref<VaxeeStore<Store, false>[Name]>;
    _store: string;
}
type CreateVaxeeStore = <Store extends BaseStore>(name: string, store: () => Store) => UseVaxeeStore<Store>;
export declare const createStore: CreateVaxeeStore;
export {};
