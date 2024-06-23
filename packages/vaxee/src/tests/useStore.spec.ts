import { beforeEach, describe, it, expect } from "vitest";
import { createVaxee, defineStore, setVaxeeInstance } from "..";

describe("useStore", () => {
  beforeEach(() => {
    setVaxeeInstance(createVaxee());
  });

  const useStore = defineStore("store", () => ({
    count: 0,
    increment(count?: number) {
      this.count += count || 1;
    },
  }));

  it("can use simple store", () => {
    const store = useStore();

    expect(store.count).toEqual(0);
    store.increment();
    expect(store.count).toEqual(1);
    store.increment(2);
    expect(store.count).toEqual(3);
    store.count++;
    expect(store.count).toEqual(4);
  });

  it("can use store with destructuring", () => {
    const { count, increment } = useStore(true);

    expect(count.value).toEqual(0);
    count.value++;
    expect(count.value).toEqual(1);
    increment();
    expect(count.value).toEqual(2);
  });

  it("can use store with named getter", () => {
    const count = useStore("count");
    const increment = useStore("increment");

    expect(count.value).toEqual(0);
    count.value++;
    expect(count.value).toEqual(1);
    increment();
    expect(count.value).toEqual(2);
  });

  it("can use store with getter functions", () => {
    const count = useStore((c) => c.count);
    const increment = useStore((c) => c.increment);

    expect(count.value).toEqual(0);
    expect(() => count.value++).toThrowError();
    expect(count.value).toEqual(0);
    increment();
    expect(count.value).toEqual(1);
  });

  it("can use store with getter and setter", () => {
    const count = useStore({
      get: (c) => c.count,
      set: (c, v) => (c.count = v),
    });

    expect(count.value).toEqual(0);
    count.value++;
    expect(count.value).toEqual(1);
  });

  it("check $state and $actions", () => {
    const store = useStore();

    expect(store.$state.count).toEqual(0);
    store.$actions.increment();
    expect(store.$state.count).toEqual(1);
    expect(store.count).toEqual(1);
    // @ts-expect-error
    expect(store.$actions.count).not.toBeDefined();
    // @ts-expect-error
    expect(store.$state.increment).not.toBeDefined();
  });
});
