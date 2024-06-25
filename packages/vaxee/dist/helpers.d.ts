import type { UnwrapNestedRefs } from "vue";
export type VaxeeStoreStateNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type VaxeeStoreState<T> = UnwrapNestedRefs<Pick<T, VaxeeStoreStateNames<T>>>;
export type VaxeeStoreActionsNames<T> = {
    [K in keyof T]: T[K] extends Function ? K extends `$${string}` ? never : K : never;
}[keyof T];
export type VaxeeStoreActions<T> = Pick<T, VaxeeStoreActionsNames<T>>;
export type VaxeeStoreGettersNames<T> = {
    [K in keyof T]: T[K] extends Function ? K extends `$${infer P}` ? P : never : never;
}[keyof T];
export type VaxeeStoreGetters<T> = Readonly<UnwrapNestedRefs<{
    [K in keyof Pick<T, VaxeeStoreGettersNames<T>>]: ReturnType<T[`$${K}`]>;
}>>;
