import { type App, type Ref } from "vue";
import type { VaxeeStoreState } from "./helpers";
import type { BaseStore, VaxeeStore } from "./store/defineStore";
declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $vaxee: Vaxee;
    }
}
export declare const vaxeeSymbol: unique symbol;
export interface Vaxee {
    install(app: App): void;
    state: Ref<Record<string, VaxeeStoreState<BaseStore>>>;
    _stores: Record<string, VaxeeStore<any, any>>;
}
export declare function setVaxeeInstance(instance: Vaxee): void;
export declare const getVaxeeInstance: () => Vaxee | null;
export declare function createVaxee(): Vaxee;
