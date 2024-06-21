import { type Ref, type ToRefs } from "vue";
import type { FunctionProperties, NonFunctionProperties } from "../models/helpers";
export type BaseStore = Record<string | number | symbol, unknown>;
type BaseGetter<Store extends BaseStore> = (state: Store) => any;
type BaseGetterSetter<State extends NonFunctionProperties<BaseStore>, Value extends any> = {
    get: (state: State) => Value;
    set: (state: State, value: Value) => void;
};
export type VaxeeStore<State, Actions, Refs extends boolean = false> = (Refs extends true ? ToRefs<State> : State) & Actions & {
    $state: State;
    $actions: Actions;
    $reset: () => void;
};
export interface UseVaxeeStore<Store extends BaseStore, State extends NonFunctionProperties<Store>, Actions extends FunctionProperties<Store>> {
    (): VaxeeStore<State, Actions>;
    <R extends boolean>(refs: R): R extends true ? VaxeeStore<State, Actions, true> : VaxeeStore<State, Actions>;
    <Getter extends BaseGetter<VaxeeStore<State, Actions>>>(getter: Getter): ReturnType<Getter> extends (...args: any) => any ? ReturnType<Getter> : Ref<ReturnType<Getter>>;
    <Value extends any>(getterSetter: BaseGetterSetter<State, Value>): Ref<Value>;
    <Name extends keyof VaxeeStore<State, Actions>>(name: Name): VaxeeStore<State, Actions>[Name] extends (...args: any) => any ? VaxeeStore<State, Actions>[Name] : Ref<VaxeeStore<State, Actions>[Name]>;
}
export declare function defineStore<Store extends BaseStore, State extends NonFunctionProperties<Store>, Actions extends FunctionProperties<Store>>(name: string, store: () => Store): UseVaxeeStore<Store, State, Actions>;
export {};
