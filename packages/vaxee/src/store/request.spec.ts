import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";
import {
  checkPrivateRequest,
  isRequest,
  request,
  VaxeeRequestStatus,
} from "./request";
import { createStore } from "./createStore";
import { createVaxee, setVaxeeInstance } from "../plugin";

describe("request", () => {
  beforeEach(() => {
    setVaxeeInstance(createVaxee());
  });

  it("should be the same request", () => {
    const useStore = createStore("store", ({ request }) => {
      const q = request(() => Promise.resolve(1));
      return { q };
    });

    const store1 = useStore();
    const store2 = useStore();

    expect(store1.q).toBe(store2.q);
  });

  it("should reuse promise", async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ request }) => {
      const q = request(() => {
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

  it("fetch simple request", async () => {
    const _q = request(() => Promise.resolve(1));

    checkPrivateRequest(_q);

    const q = _q._init("", "");

    expect(q.status.value).toBe("fetching");

    await nextTick();

    expect(q.status.value).toBe("success");
    expect(q.data.value).toBe(1);
  });

  it("fetch error request", async () => {
    const _q = request(() => Promise.reject(new Error("error")));

    checkPrivateRequest(_q);

    const q = _q._init("", "");

    expect(q.status.value).toBe("fetching");

    await nextTick();

    expect(q.status.value).toBe("error");
    expect(q.error.value!.message).toBe("error");
  });

  it("check is a request", () => {
    const q = request(() => Promise.resolve(1));

    expect(isRequest(q)).toBe(true);

    checkPrivateRequest(q);

    expect(q._init("", "").status.value).toBe("fetching");
  });

  it("check request in store", async () => {
    const useStore = createStore("store", ({ request }) => {
      const q = request(() => Promise.resolve(1));
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

  it("check request send once", async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ request }) => {
      const q = request(() => {
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
    const useStore = createStore("store", ({ request }) => {
      const q = request(() => Promise.resolve(1));
      return { q };
    });

    const { q } = useStore();

    await q.suspense();

    expect(q.data.value).toBe(1);
  });

  it("should work with destructuring", async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ request }) => {
      const q = request(() => {
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

  it("check refresh request", async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ request }) => {
      const q = request(() => {
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

    const useStore = createStore("store", ({ request }) => {
      const q = request(() => {
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

    const useStore = createStore("store", ({ request }) => {
      const q = request(() => Promise.reject(new Error("error")), {
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

    const useStore = createStore("store", ({ state, request }) => {
      const count = state(0);
      const q = request(
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
      request(() => 1, { watch: [1] });
    }).toThrow();
  });

  it('should check "onSuccess" callback', async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ request }) => {
      const q = request(() => Promise.resolve(1));
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

    const useStore = createStore("store", ({ request }) => {
      const q = request(() => Promise.reject(new Error("error")));
      return { q };
    });

    const { onError, execute } = useStore("q");

    await nextTick();

    onError(spy);

    expect(spy).toHaveBeenCalledTimes(1);

    await execute();

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("should work with await", async () => {
    const useStore = createStore("store", ({ request }) => {
      const q = request(() => Promise.resolve(1));
      return { q };
    });

    const q = await useStore("q");

    expect(q.data.value).toBe(1);
    expect(q).not.toBeInstanceOf(Promise);
  });

  it("should work without await", async () => {
    const useStore = createStore("store", ({ request }) => {
      const q = request(() => Promise.resolve(1));
      return { q };
    });

    const q = useStore("q");

    expect(q).toBeInstanceOf(Promise);
    await q.suspense();
    expect(q.data.value).toBe(1);
  });

  it('shoudn\'t send request if mode "manual"', async () => {
    const spy = vi.fn();

    const useStore = createStore("store", ({ request }) => {
      const q = request(
        () => {
          spy();
          return Promise.resolve(1);
        },
        {
          mode: "manual",
        }
      );
      return { q };
    });

    const { q } = useStore();

    await nextTick();

    expect(spy).toHaveBeenCalledTimes(0);
    expect(q.data.value).toBe(null);
    expect(q.status.value).toBe(VaxeeRequestStatus.Idle);
  });

  it("should work with param", async () => {
    const useStore = createStore("store", ({ request }) => {
      const q = request(({ param }: { param: number }) => {
        return Promise.resolve(param);
      });
      return { q };
    });

    const { q } = useStore();

    expect(q.data.value).toBe(null);

    await q.execute(1);

    expect(q.data.value).toBe(1);
  });

  it("should work with default param", async () => {
    const useStore = createStore("store", ({ request }) => {
      const q = request(({ param = 1 }: { param: number }) => {
        return Promise.resolve(param);
      });
      return { q };
    });

    const { data, execute } = await useStore("q");

    expect(data.value).toBe(1);

    await execute(2);

    expect(data.value).toBe(2);
  });

  it("should save param when refresh", async () => {
    const useStore = createStore("store", ({ request }) => {
      const q = request(({ param = 1 }: { param: number }) => {
        return Promise.resolve(param);
      });
      return { q };
    });

    const { data, refresh, execute } = await useStore("q");

    expect(data.value).toBe(1);

    await refresh();

    expect(data.value).toBe(1);

    await execute(2);

    expect(data.value).toBe(2);

    await refresh();

    expect(data.value).toBe(2);
  });
});
