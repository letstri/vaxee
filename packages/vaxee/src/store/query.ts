import { ref, type Ref } from "vue";
import { useVaxee } from "../composables/useVaxee";

const querySymbol = Symbol("vaxee-query");

export enum VaxeeQueryStatus {
  NotFetched = "not-fetched",
  Fetching = "fetching",
  Refreshing = "refreshing",
  Error = "error",
  Success = "success",
}

export type VaxeeQueryState<T> = {
  data: Ref<null | T>;
  error: Ref<null | Error>;
  status: Ref<VaxeeQueryStatus>;
  suspense: () => Promise<void>;
  refresh: () => Promise<void>;
};

export type VaxeeQuery<T> = {
  (store: string, key: string): VaxeeQueryState<T>;
  QuerySymbol: typeof querySymbol;
};

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
  function _query(store: string, key: string) {
    let abortController: AbortController | null = null;
    const vaxee = useVaxee();

    const q = {
      data: ref(null),
      error: ref(null),
      status: ref(
        options.sendManually
          ? VaxeeQueryStatus.NotFetched
          : VaxeeQueryStatus.Fetching
      ),
      suspense: () => Promise.resolve(),
    } as VaxeeQueryState<T>;

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

    q.refresh = async () => {
      q.status.value = VaxeeQueryStatus.Refreshing;
      q.error.value = null;
      const promise = sendQuery();

      q.suspense = () => promise;

      return promise;
    };

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

      q.suspense = () => Promise.resolve();

      return q;
    }

    if (!options.sendManually) {
      const promise = sendQuery();

      q.suspense = () => promise;
    }

    return q;
  }

  _query.QuerySymbol = querySymbol;

  return _query;
}

export const isQuery = (query: any): query is VaxeeQuery<any> =>
  query?.QuerySymbol === querySymbol;
