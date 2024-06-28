import type { UnwrapNestedRefs } from "vue";
import type { VaxeeGetter, VaxeeState } from "./store/reactivity";
type VaxeeStoreStateNames<T> = {
    [K in keyof T]: T[K] extends VaxeeState<any> ? K : never;
}[keyof T];
export type VaxeeStoreState<T> = UnwrapNestedRefs<Pick<T, VaxeeStoreStateNames<T>>>;
type VaxeeStoreGettersNames<T> = {
    [K in keyof T]: T[K] extends VaxeeGetter<any> ? K : never;
}[keyof T];
export type VaxeeStoreGetters<T> = UnwrapNestedRefs<Pick<T, VaxeeStoreGettersNames<T>>>;
type VaxeeStoreActionsNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
export type VaxeeStoreActions<T> = Pick<T, VaxeeStoreActionsNames<T>>;
export type VaxeeStoreOther<T> = UnwrapNestedRefs<Omit<T, VaxeeStoreStateNames<T> | VaxeeStoreGettersNames<T> | VaxeeStoreActionsNames<T>>>;
export {};
