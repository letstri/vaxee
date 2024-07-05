import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";
import { isQuery, query } from "./query";
import { createStore } from "./createStore";
import { createVaxeePlugin, setVaxeeInstance } from "../plugin";

describe("query", () => {
  beforeEach(() => {
    setVaxeeInstance(createVaxeePlugin());
  });

  it("fetch simple query", async () => {
    const q = query(() => Promise.resolve(1))();
    expect(q.value.status).toBe("pending");

    await nextTick();

    expect(q.value.status).toBe("success");
    expect(q.value.data).toBe(1);
  });

  it("fetch error query", async () => {
    const q = query(() => Promise.reject(new Error("error")))();
    expect(q.value.status).toBe("pending");

    await nextTick();

    expect(q.value.status).toBe("error");
    expect(q.value.error!.message).toBe("error");
  });

  it("check is a query", () => {
    const q = query(() => Promise.resolve(1));

    expect(isQuery(q)).toBe(true);
    expect(q().value.status).toBe("pending");
  });

  it("check query in store", async () => {
    const useStore = createStore("store", ({ query }) => {
      const q = query(() => Promise.resolve(1));
      return { q };
    });

    const store = useStore();

    expect(store.q.value.status).toBe("pending");

    await nextTick();

    expect(store.q.value.status).toBe("success");
    expect(store.q.value.data).toBe(1);

    const flatStore = useStore(false);

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

    expect(q.value.data).toBe(1);
  });
});
