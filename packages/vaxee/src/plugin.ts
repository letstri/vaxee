import { ref, type App, type Ref } from "vue";
import type { VaxeeStoreState } from "./helpers";
import type { VaxeeStore } from "./store/createStore";
import { IS_CLIENT, IS_DEV, VAXEE_LOG_START } from "./constants";

export const vaxeeSymbol = Symbol("vaxee");

export interface Vaxee {
  install(app: App): void;
  state: Ref<Record<string, VaxeeStoreState<any>>>;
  _stores: Record<string, VaxeeStore<any>>;
}

let vaxeeInstance: Vaxee | null = null;

export function setVaxeeInstance(instance: Vaxee) {
  vaxeeInstance = instance;
}

export const getVaxeeInstance = () => vaxeeInstance;

export function createVaxeePlugin() {
  const vaxee: Vaxee = {
    install(app: App) {
      setVaxeeInstance(vaxee);
      app.provide(vaxeeSymbol, vaxee);

      if (IS_DEV && IS_CLIENT) {
        if (!__TEST__) {
          console.log(
            VAXEE_LOG_START +
              "Store successfully installed. Enjoy! Also you can check current Vaxee state by using a `$vaxee` property in the `window`."
          );
        }
        // @ts-ignore
        window.$vaxee = vaxee.state.value;
      }
    },
    state: ref({}),
    _stores: {},
  };

  return vaxee;
}
