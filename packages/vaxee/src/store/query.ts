import { ref, watch, type Ref, type WatchSource } from "vue";
import { useVaxee } from "../composables/useVaxee";
import { IS_CLIENT, VAXEE_LOG_START } from "../constants";
import { isGetter, isState } from "./reactivity";

const querySymbol = Symbol("vaxee-query");

export enum VaxeeQueryStatus {
  NotFetched = "not-fetched",
  Fetching = "fetching",
  Refreshing = "refreshing",
  Error = "error",
  Success = "success",
}

export interface VaxeeQuery<T> {
  data: Ref<null | T>;
  error: Ref<null | Error>;
  status: Ref<VaxeeQueryStatus>;
  /**
   * `suspense` gives ability to wait promise resolve without refreshing the data.
   *
   * @returns A promise that resolves when the query is done.
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
   * `execute` will fetch the query and clear the data and the error.
   *
   * @returns A promise that resolves when the query is done.
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
   * `refresh` will fetch the query without clearing the data and the error.
   *
   * @returns A promise that resolves when the query is done.
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

interface VaxeePrivateQuery<T> extends VaxeeQuery<T> {
  QuerySymbol: typeof querySymbol;
  _init(store: string, key: string): VaxeeQuery<T>;
}

export function checkPrivateQuery(
  query: any
): asserts query is VaxeePrivateQuery<any> {
  if (query?.QuerySymbol !== querySymbol) {
    throw new Error("This is not a private query");
  }
}

interface VaxeeQueryParams {
  /**
   * The signal to use for the query.
   */
  signal: AbortSignal;
}

interface VaxeeQueryOptions {
  /**
   * If `true`, the query will not be automatically fetched when the component is mounted. Default `false`.
   */
  sendManually?: boolean;
  /**
   * A callback that will be called when an error occurs during the query.
   */
  onError?: <E = unknown>(error: E) => any;
  /**
   * If `false`, the query will not be automatically fetched on the server side. Default `true`.
   */
  ssr?: boolean;
  /**
   * An array of refs that will be watched to trigger a query `refresh` function.
   */
  watch?: WatchSource[];
}

export function query<T>(
  callback: (params: VaxeeQueryParams) => T | Promise<T>,
  options: VaxeeQueryOptions = {}
): VaxeeQuery<T> {
  const q: VaxeeQuery<T> = {
    data: ref<T | null>(null) as Ref<T | null>,
    error: ref<Error | null>(null),
    status: ref<VaxeeQueryStatus>(
      options.sendManually
        ? VaxeeQueryStatus.NotFetched
        : VaxeeQueryStatus.Fetching
    ),
    suspense: () => Promise.resolve(),
    async execute() {
      q.status.value = VaxeeQueryStatus.Fetching;
      q.data.value = null;
      q.error.value = null;
      const promise = sendQuery();

      q.suspense = () => promise;

      return promise;
    },
    async refresh() {
      q.status.value = VaxeeQueryStatus.Refreshing;
      q.error.value = null;
      const promise = sendQuery();

      q.suspense = () => promise;

      return promise;
    },
    onError(callback) {
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
    },
    onSuccess(callback) {
      return watch(
        q.status,
        (status) => {
          if (status === VaxeeQueryStatus.Success) {
            callback(q.data.value!);
          }
        },
        {
          immediate: true,
        }
      );
    },
  };

  let abortController: AbortController | null = null;

  const sendQuery = async () => {
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
      q.status.value = VaxeeQueryStatus.Success;
      abortController = null;
    } catch (error) {
      if (!isAborted) {
        q.error.value = error as Error;
        q.status.value = VaxeeQueryStatus.Error;
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

    if (!options.sendManually && (IS_CLIENT || options.ssr !== false)) {
      const promise = sendQuery();

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
        VAXEE_LOG_START + "Watch should be an array of refs or computed values"
      );
    }

    watch(options.watch, q.refresh);
  }

  const returning: VaxeePrivateQuery<T> = {
    ...q,
    _init,
    QuerySymbol: querySymbol,
  };

  return returning;
}

export const isQuery = (query: any): query is VaxeeQuery<any> =>
  query?.QuerySymbol === querySymbol;
