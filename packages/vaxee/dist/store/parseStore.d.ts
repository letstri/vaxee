import type { VaxeeStoreState, VaxeeStoreActions } from "../helpers";
import type { BaseStore } from "./createStore";
export declare function parseStore<Store extends BaseStore>(store: Store): {
    state: VaxeeStoreState<Store>;
    actions: VaxeeStoreActions<Store>;
};
