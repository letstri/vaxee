import { ref, watch, type Ref, type WatchSource } from "vue";
import { useVaxee } from "../composables/useVaxee";
import { IS_CLIENT, VAXEE_LOG_START } from "../constants";
import { isGetter, isState } from "./reactivity";

const requestSymbol = Symbol("vaxee-request");

export enum VaxeeRequestStatus {
  NotFetched = "not-fetched",
  Fetching = "fetching",
  Refreshing = "refreshing",
  Error = "error",
  Success = "success",
}

export interface VaxeeRequest<T> {
  data: Ref<null | T>;
  error: Ref<null | Error>;
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
  execute: () => Promise<void>;
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

interface VaxeePrivateRequest<T> extends VaxeeRequest<T> {
  RequestSymbol: typeof requestSymbol;
  _init(store: string, key: string): VaxeeRequest<T>;
}

export function checkPrivateRequest(
  request: any
): asserts request is VaxeePrivateRequest<any> {
  if (request?.RequestSymbol !== requestSymbol) {
    throw new Error("This is not a private request");
  }
}

interface VaxeeRequestParams {
  /**
   * The signal to use for the request.
   */
  signal: AbortSignal;
}

interface VaxeeRequestOptions {
  /**
   * If `false`, the request will not be automatically fetched on the server side. Default `true`.
   */
  sendOnServer?: boolean;
  /**
   * If `true`, the request will not be automatically fetched on both client and server. Default `false`.
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

export function request<T>(
  callback: (params: VaxeeRequestParams) => T | Promise<T>,
  options: VaxeeRequestOptions = {}
): VaxeeRequest<T> {
  const q: VaxeeRequest<T> = {
    data: ref<T | null>(null) as Ref<T | null>,
    error: ref<Error | null>(null),
    status: ref<VaxeeRequestStatus>(
      options.sendManually
        ? VaxeeRequestStatus.NotFetched
        : VaxeeRequestStatus.Fetching
    ),
    suspense: () => Promise.resolve(),
    async execute() {
      q.status.value = VaxeeRequestStatus.Fetching;
      q.data.value = null;
      q.error.value = null;
      const promise = sendRequest();

      q.suspense = () => promise;

      return promise;
    },
    async refresh() {
      q.status.value = VaxeeRequestStatus.Refreshing;
      q.error.value = null;
      const promise = sendRequest();

      q.suspense = () => promise;

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
      const data = await callback({ signal: abortController.signal });

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

    if (
      !options.sendManually &&
      (IS_CLIENT || options.sendOnServer !== false)
    ) {
      const promise = sendRequest();

      q.suspense = () => promise;
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

    watch(options.watch, q.refresh);
  }

  const returning: VaxeePrivateRequest<T> = {
    ...q,
    _init,
    RequestSymbol: requestSymbol,
  };

  return returning;
}

export const isRequest = (request: any): request is VaxeeRequest<any> =>
  request?.RequestSymbol === requestSymbol;
