export type VaxeeStoreActionsNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
export type VaxeeStoreActions<T> = Pick<T, VaxeeStoreActionsNames<T>>;
export type VaxeeStoreStateNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
export type VaxeeStoreState<T> = Pick<T, VaxeeStoreStateNames<T>>;
