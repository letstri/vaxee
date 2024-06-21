import type { FunctionProperties, NonFunctionProperties } from "../models/helpers";
import type { BaseStore } from "./defineStore";
export declare function parseStore<Store extends BaseStore>(store: Store, context: BaseStore | null): {
    state: NonFunctionProperties<Store>;
    actions: FunctionProperties<Store>;
};
