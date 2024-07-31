import { ref, type App, type Ref } from "vue";
import type {
  VaxeeStoreActions,
  VaxeeStoreGetters,
  VaxeeStoreOther,
  VaxeeStoreQueries,
  VaxeeStoreState,
} from "./store/types";
import type {
  BaseStore,
  VaxeeReactiveStore,
  VaxeeStore,
} from "./store/createStore";
import { IS_CLIENT, IS_DEV, VAXEE_LOG_START } from "./constants";

export const vaxeeSymbol = Symbol("vaxee");

export type VaxeeInternalStore<
  Store extends BaseStore,
  Refs extends boolean = true
> = (Refs extends true ? VaxeeStore<Store> : VaxeeReactiveStore<Store>) & {
  _state: VaxeeStoreState<Store>;
  _actions: VaxeeStoreActions<Store>;
  _getters: VaxeeStoreGetters<Store>;
  _queries: VaxeeStoreQueries<Store>;
  _other: VaxeeStoreOther<Store>;
};

export interface Vaxee {
  install(app: App): void;
  state: Ref<Record<string, VaxeeStoreState<any>>>;
  _stores: Record<string, VaxeeInternalStore<any>>;
  _options: VaxeeOptions;
}

export interface VaxeeOptions {
  persist?: {
    get: (key: string) => any;
    set: (key: string, value: any) => any;
  };
}

let vaxeeInstance: Vaxee | null = null;

export function setVaxeeInstance(instance: Vaxee) {
  vaxeeInstance = instance;
}

export const getVaxeeInstance = () => vaxeeInstance;

export function createVaxee(options: VaxeeOptions = {}) {
  const vaxee: Vaxee = {
    install(app: App) {
      setVaxeeInstance(vaxee);
      app.provide(vaxeeSymbol, vaxee);

      if (IS_DEV && IS_CLIENT && !process.env.TEST) {
        console.log(
          VAXEE_LOG_START +
            "Store successfully installed. Enjoy! Also you can check current Vaxee state by using a `$vaxee` property in the `window`."
        );
        // @ts-ignore
        window.$vaxee = vaxee.state;
      }
    },
    state: ref({}),
    _stores: {},
    _options: options,
  };

  return vaxee;
}
