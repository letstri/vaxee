import type { BaseStore } from "./createStore";
import { type VaxeeGetter, type VaxeeState } from "./reactivity";
import { type VaxeeQuery } from "./query";
export declare function parseStore<Store extends BaseStore>(store: Store): {
    states: Record<string, VaxeeState<any>>;
    actions: Record<string, (...args: any) => any>;
    getters: Record<string, VaxeeGetter<any>>;
    queries: Record<string, VaxeeQuery<any>>;
    other: Record<string, any>;
};
