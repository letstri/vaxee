import type { BaseStore } from "./createStore";
export declare function parseStore<Store extends BaseStore>(store: Store): {
    state: any;
    actions: any;
    getters: any;
};
