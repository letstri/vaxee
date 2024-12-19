import { reactive, ref, type App, type Ref } from "vue";
import * as devalue from "devalue";
import type {
  VaxeeStoreActions,
  VaxeeStoreGetters,
  VaxeeStoreOther,
  VaxeeStoreRequests,
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
  _requests: VaxeeStoreRequests<Store>;
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

      if (IS_DEV && IS_CLIENT && !import.meta.env.TEST) {
        console.log(
          VAXEE_LOG_START +
            "Store successfully installed. Enjoy! Also you can check current Vaxee state by calling a `$vaxee()` method in the `window`."
        );
        // @ts-ignore
        window.$vaxee = () =>
          devalue.parse(devalue.stringify(reactive(vaxee.state)))._value;
      }
    },
    state: ref({}),
    _stores: {},
    _options: options,
  };

  return vaxee;
}
