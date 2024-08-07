import { readonly, ref, type Ref } from "vue";
import { useVaxee } from "../composables/useVaxee";

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
  suspense: () => Promise<void>;
  execute: () => Promise<void>;
  refresh: () => Promise<void>;
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
   * If `true`, the query will not be automatically fetched when the component is mounted.
   */
  sendManually?: boolean;
}

export function query<T>(
  callback: (params: VaxeeQueryParams) => Promise<T>,
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
      q.data.value = null;
      q.status.value = VaxeeQueryStatus.Fetching;
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
      }
    }
  };

  function _init(store: string, key: string) {
    const vaxee = useVaxee();

    const initial =
      vaxee.state.value[store]?.[key] &&
      vaxee.state.value[store][key].status !== "fetching"
        ? {
            data: vaxee.state.value[store][key].data,
            status: vaxee.state.value[store][key].status,
            error: vaxee.state.value[store][key].error,
          }
        : undefined;

    if (initial) {
      q.data.value = initial.data;
      q.error.value = initial.error;
      q.status.value = initial.status;

      return q;
    }

    if (!options.sendManually) {
      const promise = sendQuery();

      q.suspense = () => promise;
    }

    return q;
  }

  const returning: VaxeePrivateQuery<T> = {
    ...q,
    status: readonly(q.status),
    data: readonly(q.data) as VaxeeQuery<T>["data"],
    error: readonly(q.error),
    _init,
    QuerySymbol: querySymbol,
  };

  return returning;
}

export const isQuery = (query: any): query is VaxeeQuery<any> =>
  query?.QuerySymbol === querySymbol;
