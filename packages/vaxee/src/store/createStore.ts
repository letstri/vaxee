import { computed, reactive, type ToRefs, type UnwrapNestedRefs } from "vue";
import { getVaxeeInstance } from "../plugin";
import type {
  VaxeeStoreState,
  VaxeeStoreActions,
  VaxeeStoreGetters,
  VaxeeStoreOther,
  VaxeeStoreRequests,
} from "./types";
import { IS_DEV, VAXEE_LOG_START } from "../constants";
import { prepareStore } from "./prepareStore";
import { getter, state } from "./reactivity";
import { request, type VaxeeRequest } from "./request";
import type { Promiseable, ToComputedRefs } from "../types";

export type BaseStore = Record<string, any>;

export type VaxeeStore<Store extends BaseStore> = ToRefs<
  VaxeeStoreState<Store>
> &
  ToComputedRefs<VaxeeStoreGetters<Store>> &
  VaxeeStoreRequests<Store> &
  VaxeeStoreActions<Store> &
  VaxeeStoreOther<Store>;

export type VaxeeReactiveStore<Store extends BaseStore> =
  VaxeeStoreState<Store> &
    VaxeeStoreGetters<Store> &
    UnwrapNestedRefs<VaxeeStoreRequests<Store>> &
    VaxeeStoreActions<Store> &
    VaxeeStoreOther<Store>;

interface UseVaxeeStore<Store extends BaseStore> {
  (): VaxeeStore<Store>;
  <Name extends keyof VaxeeStore<Store>>(
    name: Name
  ): VaxeeStore<Store>[Name] extends VaxeeRequest<infer T, infer P>
    ? Promiseable<VaxeeRequest<T, P>>
    : VaxeeStore<Store>[Name];
  $inferState: VaxeeStoreState<Store>;
  reactive: () => VaxeeReactiveStore<Store>;
}

export const createStore = <Store extends BaseStore>(
  name: string,
  store: (options: {
    state: typeof state;
    getter: typeof getter;
    request: typeof request;
  }) => Store
): UseVaxeeStore<Store> => {
  type State = VaxeeStoreState<Store>;
  type Actions = VaxeeStoreActions<Store>;
  type Getters = VaxeeStoreGetters<Store>;
  type Requests = VaxeeStoreRequests<Store>;
  type Other = VaxeeStoreOther<Store>;

  if (getVaxeeInstance()?._stores[name]) {
    if (IS_DEV) {
      console.warn(
        VAXEE_LOG_START +
          `The store with name "${name}" already exists. In production, this will throw an error.`
      );
    } else {
      throw new Error(
        VAXEE_LOG_START + `The store with name "${name}" already exists.`
      );
    }
  }

  function use(propName?: keyof VaxeeStore<Store>) {
    if (propName !== undefined && typeof propName !== "string") {
      throw new Error(
        VAXEE_LOG_START +
          `The prop name must be a string when using the store "${name}"`
      );
    }

    const _store = prepareStore(name, store({ state, getter, request }));

    // error handler if propName not exist inside _store
    if (propName !== undefined && !Object.keys(_store).includes(propName)) {
      throw new Error(
        VAXEE_LOG_START +
          `The prop name "${propName}" does not exist in the store "${name}"`
      );
    }

    if (propName) {
      if (_store._actions[propName as keyof Actions]) {
        return _store._actions[propName as keyof Actions];
      }

      if (_store._getters[propName as keyof Getters]) {
        return _store._getters[propName as keyof Getters];
      }

      if (_store._requests[propName as keyof Requests]) {
        const request = _store._requests[propName as keyof Requests];
        const requestPromise = Promise.resolve(request.suspense()).then(
          () => request
        );

        Object.assign(requestPromise, request);

        return requestPromise;
      }

      if (_store._other[propName as keyof Other]) {
        return _store._other[propName as keyof Other];
      }

      return computed({
        get: () => _store._state[propName as keyof State],
        set: (value) => {
          _store._state[propName as keyof State] = value;
        },
      }) as any; // TODO: remove any
    }

    return _store;
  }

  use.$inferState = {} as State;
  use.reactive = () => reactive(use());

  return use;
};
