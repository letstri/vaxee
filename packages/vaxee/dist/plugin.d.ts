import { type App, type Ref } from "vue";
import type { VaxeeStoreState } from "./helpers";
import type { VaxeeStore } from "./store/createStore";
declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $vaxee: Vaxee;
    }
}
export declare const vaxeeSymbol: unique symbol;
export interface Vaxee {
    install(app: App): void;
    state: Ref<Record<string, VaxeeStoreState<any>>>;
    _stores: Record<string, VaxeeStore<any>>;
}
export declare function setVaxeeInstance(instance: Vaxee): void;
export declare const getVaxeeInstance: () => Vaxee | null;
export declare function createVaxeePlugin(): Vaxee;
