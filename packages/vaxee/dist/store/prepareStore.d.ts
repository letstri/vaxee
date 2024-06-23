import type { VaxeeStoreState, VaxeeStoreActions } from "../helpers";
import { type BaseStore, type VaxeeStore } from "./defineStore";
export declare function prepareStore<Store extends BaseStore, State extends VaxeeStoreState<Store>, Actions extends VaxeeStoreActions<Store>>(store: (options: any) => Store, name: string): VaxeeStore<State, Actions>;
