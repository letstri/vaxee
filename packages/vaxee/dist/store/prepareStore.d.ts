import type { BaseStore, VaxeeStore } from "./createStore";
export declare function prepareStore<Store extends BaseStore>(name: string, store: Store): VaxeeStore<Store>;
