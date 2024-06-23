import { type Ref, type ToRefs } from "vue";
import type { VaxeeStoreState, VaxeeStoreActions } from "../helpers";
export type BaseStore = Record<string | number | symbol, any>;
type BaseGetter<State> = (state: State) => any;
type BaseGetterSetter<State, Value> = {
    get: (state: State) => Value;
    set: (state: State, value: Value) => void;
};
export type VaxeeStore<State extends VaxeeStoreState<any>, Actions extends VaxeeStoreActions<any>, Refs extends boolean = true> = (Refs extends true ? ToRefs<State> : State) & Actions & {
    $state: State;
    $actions: Actions;
    $reset: () => void;
};
export interface UseVaxeeStore<State extends VaxeeStoreState<any>, Actions extends VaxeeStoreActions<any>> {
    (): VaxeeStore<State, Actions, false>;
    <R extends boolean>(refs: R): R extends true ? VaxeeStore<State, Actions> : VaxeeStore<State, Actions, false>;
    <Getter extends BaseGetter<VaxeeStore<State, Actions, false>>>(getter: Getter): ReturnType<Getter> extends (...args: any) => any ? ReturnType<Getter> : Ref<ReturnType<Getter>>;
    <Value extends any>(getterSetter: BaseGetterSetter<State, Value>): Ref<Value>;
    <Name extends keyof VaxeeStore<State, Actions>>(name: Name): VaxeeStore<State, Actions, false>[Name] extends (...args: any) => any ? VaxeeStore<State, Actions, false>[Name] : Ref<VaxeeStore<State, Actions, false>[Name]>;
    _store: string;
}
export declare function createStore<Store extends BaseStore, State extends VaxeeStoreState<Store>, Actions extends VaxeeStoreActions<Store>>(name: string, store: () => Store): UseVaxeeStore<State, Actions>;
export {};
