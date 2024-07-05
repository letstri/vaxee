import { state, type VaxeeState } from "./reactivity";

const querySymbol = Symbol("vaxee-query");

export type VaxeeQueryState<T> = (
  | VaxeeState<{
      data: null;
      error: null;
      status: "pending";
    }>
  | VaxeeState<{
      data: null;
      error: Error;
      status: "error";
    }>
  | VaxeeState<{
      data: T;
      error: null;
      status: "success";
    }>
) & {
  suspense: () => Promise<void>;
  refresh: () => Promise<void>;
  execute: () => Promise<void>;
};

type VaxeeQueryOptions<T> = {
  initial?: {
    data: T;
    error: Error;
    status: "pending" | "error" | "success";
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

    const q = state({
      data: null,
      error: null,
      status: "pending",
    }) as VaxeeQueryState<T>;

    const fetchQuery = async () => {
      try {
        const data = await callback();

        q.value.data = data;
        q.value.status = "success";
      } catch (error) {
        q.value.error = error as Error;
        q.value.status = "error";
      }
    };

    q.refresh = async () => {
      q.value.status = "pending";
      q.value.error = null;
      const promise = fetchQuery();

      q.suspense = () => promise;

      return promise;
    };

    q.execute = async () => {
      q.value.data = null;
      return q.refresh();
    };

    if (_options?.initial) {
      q.value.data = _options?.initial.data;
      q.value.error = _options?.initial.error;
      q.value.status = _options?.initial.status;

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
