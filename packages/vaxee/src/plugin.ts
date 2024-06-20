import { type UnwrapRef, ref, type App, type Ref } from "vue";
import type {
  FunctionProperties,
  NonFunctionProperties,
} from "./models/helpers";
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

let vaxeeInstance: Vaxee | null = null;

export function setVaxeeInstance(instance: Vaxee) {
  vaxeeInstance = instance;
}

export const getVaxeeInstance = () => vaxeeInstance;

export function vaxeePlugin() {
  const vaxee: Vaxee = {
    install(app: App) {
      setVaxeeInstance(vaxee);
      app.config.globalProperties.$vaxee = vaxee.state;
      app.provide("vaxee", vaxee.state);

      if (
        process.env.NODE_ENV === "development" &&
        typeof window !== "undefined"
      ) {
        console.log(
          "[🌱 vaxee]: Store successfully installed. Enjoy! Also you can check current Vaxee state by using a `$vaxee` property in the `window`."
        );
        // @ts-ignore
        window.$vaxee = vaxee.state;
      }
    },
    state: ref({}) satisfies Vaxee["state"],
    _actions: {},
    _stores: {},
  };

  return vaxee;
}
