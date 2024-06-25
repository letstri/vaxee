import type { BaseStore } from "./createStore";
import { type VaxeeGetter, type VaxeeState } from "./reactivity";
export declare function parseStore<Store extends BaseStore>(store: Store): {
    states: Record<string, VaxeeState<any>>;
    actions: Record<string, (...args: any) => any>;
    getters: Record<string, VaxeeGetter<any>>;
    other: Record<string, any>;
};
