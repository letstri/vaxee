import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";
import { checkPrivateQuery, isQuery, query } from "./query";
import { createStore } from "./createStore";
import { createVaxee, setVaxeeInstance } from "../plugin";

describe("query", () => {
  beforeEach(() => {
    setVaxeeInstance(createVaxee());
  });

  it("should be the same query", () => {
    const useStore = createStore("store", ({ query }) => {
      const q = query(() => Promise.resolve(1));
      return { q };
    });

    const store1 = useStore();
    const store2 = useStore();

    expect(store1.q).toBe(store2.q);
  });

  it("should reuse promise", async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ query }) => {
      const q = query(() => {
        spy();
        return Promise.resolve(1);
      });
      return { q };
    });

    const store1 = useStore();
    const store2 = useStore();

    expect(spy).toHaveBeenCalledTimes(1);

    await store1.q.suspense();

    expect(store1.q.data.value).toBe(1);
    expect(store2.q.data.value).toBe(1);

    expect(spy).toHaveBeenCalledTimes(1);

    await Promise.all([store1.q.suspense(), store2.q.suspense()]);

    expect(store1.q.data.value).toBe(1);
    expect(store2.q.data.value).toBe(1);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("fetch simple query", async () => {
    const _q = query(() => Promise.resolve(1));

    checkPrivateQuery(_q);

    const q = _q._init("", "");

    expect(q.status.value).toBe("fetching");

    await nextTick();

    expect(q.status.value).toBe("success");
    expect(q.data.value).toBe(1);
  });

  it("fetch error query", async () => {
    const _q = query(() => Promise.reject(new Error("error")));

    checkPrivateQuery(_q);

    const q = _q._init("", "");

    expect(q.status.value).toBe("fetching");

    await nextTick();

    expect(q.status.value).toBe("error");
    expect(q.error.value!.message).toBe("error");
  });

  it("check is a query", () => {
    const q = query(() => Promise.resolve(1));

    expect(isQuery(q)).toBe(true);

    checkPrivateQuery(q);

    expect(q._init("", "").status.value).toBe("fetching");
  });

  it("check query in store", async () => {
    const useStore = createStore("store", ({ query }) => {
      const q = query(() => Promise.resolve(1));
      return { q };
    });

    const store = useStore();

    expect(store.q.status.value).toBe("fetching");

    await nextTick();

    expect(store.q.status.value).toBe("success");
    expect(store.q.data.value).toBe(1);

    const flatStore = useStore.reactive();

    expect(flatStore.q.status).toBe("success");
  });

  it("check query send once", async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ query }) => {
      const q = query(() => {
        spy();
        return Promise.resolve(1);
      });
      return { q };
    });

    useStore();
    expect(spy).toHaveBeenCalledTimes(1);
    useStore();
    expect(spy).toHaveBeenCalledTimes(1);
    useStore();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should wait suspense", async () => {
    const useStore = createStore("store", ({ query }) => {
      const q = query(() => Promise.resolve(1));
      return { q };
    });

    const { q } = useStore();

    await q.suspense();

    expect(q.data.value).toBe(1);
  });

  it("should work with destructuring", async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ query }) => {
      const q = query(() => {
        spy();
        return Promise.resolve(1);
      });
      return { q };
    });

    expect(spy).toHaveBeenCalledTimes(0);

    const { q } = useStore();

    expect(spy).toHaveBeenCalledTimes(1);

    expect(q.status.value).toBe("fetching");

    await nextTick();

    expect(q.status.value).toBe("success");
    expect(q.data.value).toBe(1);

    const store = useStore.reactive();

    expect(spy).toHaveBeenCalledTimes(1);

    expect(store.q.status).toBe("success");
    expect(store.q.data).toBe(1);
  });

  it("check refresh query", async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ query }) => {
      const q = query(() => {
        spy();
        return Promise.resolve(1);
      });
      return { q };
    });

    const { q } = useStore();

    await q.suspense();

    expect(spy).toHaveBeenCalledTimes(1);

    q.refresh();

    expect(q.data.value).toBe(1);
    expect(q.error.value).toBe(null);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(q.data.value).toBe(1);
  });

  it("check execute function", async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ query }) => {
      const q = query(() => {
        spy();
        return Promise.resolve(1);
      });
      return { q };
    });

    const { q } = useStore();

    await q.suspense();

    expect(spy).toHaveBeenCalledTimes(1);

    q.execute();

    expect(q.data.value).toBe(null);
    expect(q.error.value).toBe(null);

    await q.suspense();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(q.data.value).toBe(1);
  });

  it('check "onError" option', async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ query }) => {
      const q = query(() => Promise.reject(new Error("error")), {
        onError: spy,
      });
      return { q };
    });

    const { q } = useStore();

    await nextTick();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(q.error.value!.message).toBe("error");
  });

  it("should watch dependencies", async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ state, query }) => {
      const count = state(0);
      const q = query(
        () => {
          spy();
          return 1;
        },
        {
          watch: [count],
        }
      );
      return { count, q };
    });

    const { count } = useStore();

    await nextTick();

    expect(spy).toHaveBeenCalledTimes(1);

    count.value++;

    await nextTick();

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should throw error if "watch" is not valid array', () => {
    expect(() => {
      // @ts-expect-error
      query(() => 1, { watch: [1] });
    }).toThrow();
  });

  it('should check "onSuccess" callback', async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ query }) => {
      const q = query(() => Promise.resolve(1));
      return { q };
    });

    const { onSuccess, refresh } = useStore("q");

    await nextTick();

    let res: null | number = null;

    onSuccess((data) => {
      res = data;
      spy();
    });

    expect(res).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);

    await refresh();

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should check "onError" callback', async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ query }) => {
      const q = query(() => Promise.reject(new Error("error")));
      return { q };
    });

    const { onError, execute } = useStore("q");

    await nextTick();

    onError(spy);

    expect(spy).toHaveBeenCalledTimes(1);

    await execute();

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
