import { type App, type Ref } from "vue";
import type { FunctionProperties, NonFunctionProperties } from "./models/helpers";
import type { BaseStore, UseVaxeeStore } from "./defineStore";
declare module "@vue/runtime-core" {
    interface ComponentCustomProperties {
        $vaxee: Vaxee["state"];
    }
}
export interface Vaxee {
    install(app: App): void;
    state: Ref<Record<string, NonFunctionProperties<BaseStore>>>;
    _actions: Record<string, FunctionProperties<BaseStore>>;
    _stores: Record<string, UseVaxeeStore<any, any, any>>;
}
export declare function setVaxeeInstance(instance: Vaxee): void;
export declare const getVaxeeInstance: () => Vaxee | null;
export declare function vaxeePlugin(): Vaxee;
