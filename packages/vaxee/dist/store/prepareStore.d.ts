import type { BaseStore, VaxeeStore } from "./createStore";
export declare function prepareStore<Store extends BaseStore>(store: Store, name: string): VaxeeStore<Store>;
