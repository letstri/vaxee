import type { BaseStore } from "./createStore";
import { type VaxeeGetter, type VaxeeState } from "./reactivity";
import { type VaxeeRequest } from "./request";
export declare function parseStore<Store extends BaseStore>(store: Store): {
    states: Record<string, VaxeeState<any>>;
    actions: Record<string, (...args: any) => any>;
    getters: Record<string, VaxeeGetter<any>>;
    requests: Record<string, VaxeeRequest<any, any>>;
    other: Record<string, any>;
};
