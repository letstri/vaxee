import {
  getCurrentInstance,
  onServerPrefetch,
  ref,
  watch,
  type Ref,
  type WatchSource,
} from "vue";
import { useVaxee } from "../composables/useVaxee";
import { IS_CLIENT, VAXEE_LOG_START } from "../constants";
import { isGetter, isState } from "./reactivity";

const requestSymbol = Symbol("vaxee-request");

export enum VaxeeRequestStatus {
  Idle = "idle",
  Fetching = "fetching",
  Refreshing = "refreshing",
  Error = "error",
  Success = "success",
}

export interface VaxeeRequest<T, P extends any = void> {
  data: Ref<T | null>;
  error: Ref<Error | null>;
  status: Ref<VaxeeRequestStatus>;
  /**
   * `suspense` gives ability to wait promise resolve without refreshing the data.
   *
   * @returns A promise that resolves when the request is done.
   *
   * @example
   *
   * ```ts
   * const { suspense } = useStore('products');
   *
   * await suspense();
   * ```
   */
  suspense: () => Promise<void>;
  /**
   * `execute` will fetch the request and clear the data and the error.
   *
   * @returns A promise that resolves when the request is done.
   *
   * @example
   *
   * ```ts
   * const { execute } = useStore('products');
   *
   * await execute();
   * ```
   */
  execute: (params: P) => Promise<void>;
  /**
   * `refresh` will fetch the request without clearing the data and the error.
   *
   * @returns A promise that resolves when the request is done.
   *
   * @example
   *
   * ```ts
   * const { refresh } = useStore('products');
   *
   * await refresh();
   * ```
   */
  refresh: () => Promise<void>;
  onError: <E = unknown>(callback: (error: E) => any) => any;
  onSuccess: (callback: (data: T) => any) => any;
}

interface VaxeePrivateRequest<T, P extends any = void>
  extends VaxeeRequest<T, P> {
  RequestSymbol: typeof requestSymbol;
  _init(store: string, key: string): VaxeeRequest<T, P>;
}

export function checkPrivateRequest(
  request: any
): asserts request is VaxeePrivateRequest<any, any> {
  if (request?.RequestSymbol !== requestSymbol) {
    throw new Error("This is not a private request");
  }
}

export interface VaxeeRequestParams<P extends any = void> {
  /**
   * The signal to use for the request.
   */
  signal: AbortSignal;
  /**
   * The param to use for the request.
   */
  param: P;
}

interface VaxeeRequestOptions {
  /**
   * The mode of the request.
   *
   * @default 'auto'
   */
  mode?: "auto" | "manual" | "client";
  /**
   * @deprecated use `mode: 'client'` instead
   */
  sendOnServer?: boolean;
  /**
   * @deprecated use `mode: 'manual'` instead
   */
  sendManually?: boolean;
  /**
   * An array of refs that will be watched to trigger a request `refresh` function.
   */
  watch?: WatchSource[];
  /**
   * A callback that will be called when an error occurs during the request.
   */
  onError?: <E = unknown>(error: E) => any;
}

export function request<T, P extends any = void>(
  callback: (params: VaxeeRequestParams<P>) => T | Promise<T>,
  options: VaxeeRequestOptions = {}
): VaxeeRequest<T, P> {
  // TODO: remove after v1.0.0
  if (!options.mode) {
    if (options.sendManually) {
      console.warn(
        VAXEE_LOG_START +
          "`sendManually` is deprecated. Use `mode: 'manual'` instead."
      );
      options.mode = "manual";
    } else if (options.sendOnServer) {
      console.warn(
        VAXEE_LOG_START +
          "`sendOnServer` is deprecated. Use `mode: 'client'` instead."
      );
      options.mode = "client";
    }
  }

  options.mode ||= "auto";

  const _param = ref<P | undefined>(undefined);
  const q: VaxeeRequest<T, P> = {
    data: ref<T | null>(null) as Ref<T | null>,
    error: ref<Error | null>(null),
    status: ref<VaxeeRequestStatus>(
      options.mode === "manual"
        ? VaxeeRequestStatus.Idle
        : VaxeeRequestStatus.Fetching
    ),
    suspense: () => Promise.resolve(),
    async execute(param: P) {
      if (param) {
        _param.value = param;
      }
      q.status.value = VaxeeRequestStatus.Fetching;
      q.data.value = null;
      q.error.value = null;
      const promise = sendRequest();

      q.suspense = async () => {
        await promise;
      };

      return promise;
    },
    async refresh() {
      q.status.value = VaxeeRequestStatus.Refreshing;
      q.error.value = null;
      const promise = sendRequest();

      q.suspense = async () => {
        await promise;
      };

      return promise;
    },
    onError(callback) {
      if (IS_CLIENT) {
        return watch(
          q.error,
          (error) => {
            if (error) {
              callback(error as any);
            }
          },
          {
            immediate: true,
          }
        );
      }

      return () => {};
    },
    onSuccess(callback) {
      if (IS_CLIENT) {
        return watch(
          q.status,
          (status) => {
            if (status === VaxeeRequestStatus.Success) {
              callback(q.data.value!);
            }
          },
          {
            immediate: true,
          }
        );
      }

      return () => {};
    },
  };

  let abortController: AbortController | null = null;

  const sendRequest = async () => {
    let isAborted = false;

    if (abortController) {
      abortController.abort();
    }

    abortController = new AbortController();

    abortController.signal.onabort = () => {
      isAborted = true;
    };

    try {
      const data = await callback({
        signal: abortController.signal,
        param: _param.value,
      });

      q.data.value = data;
      q.status.value = VaxeeRequestStatus.Success;
      abortController = null;
    } catch (error) {
      if (!isAborted) {
        q.error.value = error as Error;
        q.status.value = VaxeeRequestStatus.Error;
        abortController = null;
        options.onError?.(error);
      }
    }
  };

  function _init(store: string, key: string) {
    const vaxee = useVaxee();

    const initial =
      vaxee.state.value[store]?.[key] &&
      vaxee.state.value[store][key].status !== "fetching"
        ? vaxee.state.value[store][key]
        : undefined;

    if (initial) {
      q.data.value = initial.data;
      q.error.value = initial.error;
      q.status.value = initial.status;

      return q;
    }

    if (options.mode === "auto" || options.mode === "client") {
      const promise =
        options.mode === "auto" || (IS_CLIENT && options.mode === "client")
          ? sendRequest()
          : Promise.resolve();

      const instance = getCurrentInstance();

      if (options.mode === "auto" && instance) {
        onServerPrefetch(() => promise, instance);
      }

      q.suspense = async () => {
        await promise;
      };
    }

    return q;
  }

  if (options.watch) {
    if (
      options.watch.some(
        (w) => !isState(w) && !isGetter(w) && typeof w !== "function"
      )
    ) {
      throw new Error(
        VAXEE_LOG_START +
          "Watch should be an array of `state` or `getter` or `function` that returns a value"
      );
    }

    if (IS_CLIENT) {
      watch(options.watch, q.refresh);
    }
  }

  const returning: VaxeePrivateRequest<T, P> = {
    ...q,
    _init,
    RequestSymbol: requestSymbol,
  };

  return returning;
}

export const isRequest = (request: any): request is VaxeeRequest<any, any> =>
  request?.RequestSymbol === requestSymbol;
