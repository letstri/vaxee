import { ref, type Ref } from "vue";

const querySymbol = Symbol("vaxee-query");

export type VaxeeQueryState<T> = {
  data: Ref<null | T>;
  error: Ref<null | Error>;
  status: Ref<"fetching" | "refreshing" | "error" | "success">;
  suspense: () => Promise<void>;
  refresh: () => Promise<void>;
};

type VaxeeQueryOptions<T> = {
  initial?: {
    data: T;
    error: Error;
    status: "fetching" | "refreshing" | "error" | "success";
  };
};

export type VaxeeQuery<T> = {
  (options?: VaxeeQueryOptions<T>): VaxeeQueryState<T>;
  _vaxee: typeof querySymbol;
};

export function query<T>(callback: () => Promise<T>): VaxeeQuery<T> {
  // TODO: remove any
  function _query(options: any) {
    const _options = options as VaxeeQueryOptions<T>;

    const q = {
      data: ref(null),
      error: ref(null),
      status: ref("fetching"),
    } as VaxeeQueryState<T>;

    const fetchQuery = async () => {
      try {
        const data = await callback();

        q.data.value = data;
        q.status.value = "success";
      } catch (error) {
        q.error.value = error as Error;
        q.status.value = "error";
      }
    };

    q.refresh = async () => {
      q.status.value = "refreshing";
      q.error.value = null;
      const promise = fetchQuery();

      q.suspense = () => promise;

      return promise;
    };

    if (_options?.initial) {
      q.data.value = _options?.initial.data;
      q.error.value = _options?.initial.error;
      q.status.value = _options?.initial.status;

      q.suspense = () => Promise.resolve();

      return q;
    }

    const promise = fetchQuery();

    q.suspense = () => promise;

    return q;
  }

  _query._vaxee = querySymbol;

  return _query;
}

export const isQuery = (query: any): query is VaxeeQuery<any> =>
  query?._vaxee === querySymbol;
