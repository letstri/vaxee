import { type Ref, type ToRefs } from "vue";
import type { FunctionProperties, NonFunctionProperties } from "./models/helpers";
export type BaseStore = Record<string | number | symbol, unknown>;
type BaseGetter<Store extends BaseStore> = (state: Store) => any;
type BaseGetterSetter<State extends NonFunctionProperties<BaseStore>, Value extends any> = {
    get: (state: State) => Value;
    set: (state: State, value: Value) => void;
};
export interface UseVaxeeStore<Store extends BaseStore, State extends NonFunctionProperties<Store>, Actions extends FunctionProperties<Store>> {
    (): Store;
    <R extends boolean>(refs: R): R extends true ? ToRefs<State> & Actions : Store;
    <Getter extends BaseGetter<Store>>(getter: Getter): ReturnType<Getter> extends (...args: any) => any ? ReturnType<Getter> : Ref<ReturnType<Getter>>;
    <Value extends any>(getterSetter: BaseGetterSetter<State, Value>): Ref<Value>;
    <Name extends keyof Store>(name: Name): Store[Name] extends (...args: any) => any ? Store[Name] : Ref<Store[Name]>;
}
export declare function defineStore<Store extends BaseStore, State extends NonFunctionProperties<Store>, Actions extends FunctionProperties<Store>>(name: string, store: () => Store): UseVaxeeStore<Store, State, Actions>;
export {};
