import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";
import { checkPrivateQuery, isQuery, query } from "./query";
import { createStore } from "./createStore";
import { createVaxee, setVaxeeInstance } from "../plugin";

describe("query", () => {
  beforeEach(() => {
    setVaxeeInstance(createVaxee());
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

    expect(spy).toHaveBeenCalledTimes(1);

    await q.refresh();

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

    expect(spy).toHaveBeenCalledTimes(1);

    q.execute();

    expect(q.data.value).toBe(null);

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
});
