import type { BaseStore } from "./createStore";
import type { VaxeeInternalStore } from "../plugin";
export declare function prepareStore<Store extends BaseStore>(name: string, store: Store): VaxeeInternalStore<Store>;
