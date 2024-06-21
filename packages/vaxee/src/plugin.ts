import { ref, type App, type Ref } from "vue";
import type { NonFunctionProperties } from "./models/helpers";
import type { BaseStore, VaxeeStore } from "./store/defineStore";
import { IS_DEV } from "./constants";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $vaxee: Vaxee;
  }
}

export const vaxeeSymbol = Symbol("vaxee");

export interface Vaxee {
  install(app: App): void;
  state: Ref<Record<string, NonFunctionProperties<BaseStore>>>;
  _stores: Record<string, VaxeeStore<unknown, unknown>>;
}

let vaxeeInstance: Vaxee | null = null;

export function setVaxeeInstance(instance: Vaxee) {
  vaxeeInstance = instance;
}

export const getVaxeeInstance = () => vaxeeInstance;

export function createVaxee() {
  const vaxee: Vaxee = {
    install(app: App) {
      setVaxeeInstance(vaxee);
      app.provide(vaxeeSymbol, vaxee);

      if (IS_DEV && typeof window !== "undefined") {
        if (!__TEST__) {
          console.log(
            "[🌱 vaxee]: Store successfully installed. Enjoy! Also you can check current Vaxee state by using a `$vaxee` property in the `window`."
          );
        }
        // @ts-ignore
        window.$vaxee = vaxee.state;
      }
    },
    state: ref({}),
    _stores: {},
  };

  return vaxee;
}
