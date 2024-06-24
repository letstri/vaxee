import { beforeEach, describe, it, expect } from "vitest";
import { createVaxeePlugin, createStore, setVaxeeInstance } from "..";

describe("useStore", () => {
  beforeEach(() => {
    setVaxeeInstance(createVaxeePlugin());
  });

  const useMainStore = createStore("main", {
    count: 0,
    increment(count?: number) {
      this.count += count || 1;
    },
    $double() {
      return this.count * 2;
    },
  });

  it("can use simple store", () => {
    const store = useMainStore(false);

    expect(store.count).toEqual(0);
    store.increment();
    expect(store.count).toEqual(1);
    store.increment(2);
    expect(store.count).toEqual(3);
    store.count++;
    expect(store.count).toEqual(4);
    expect(store.double).toEqual(8);
  });

  it("can use store with destructuring", () => {
    const { count, increment, double } = useMainStore();

    expect(count.value).toEqual(0);
    count.value++;
    expect(count.value).toEqual(1);
    increment();
    expect(count.value).toEqual(2);
    expect(double.value).toEqual(4);
  });

  it("can use store with named getter", () => {
    const count = useMainStore("count");
    const increment = useMainStore("increment");

    expect(count.value).toEqual(0);
    count.value++;
    expect(count.value).toEqual(1);
    increment();
    expect(count.value).toEqual(2);
  });

  it("can use store with getter functions", () => {
    const count = useMainStore((c) => c.count);
    const increment = useMainStore((c) => c.increment);

    expect(count.value).toEqual(0);
    expect(() => count.value++).toThrowError();
    expect(count.value).toEqual(0);
    increment();
    expect(count.value).toEqual(1);
  });

  it("can use store with getter and setter", () => {
    const count = useMainStore({
      get: (c) => c.count,
      set: (c, v) => (c.count = v),
    });

    expect(count.value).toEqual(0);
    count.value++;
    expect(count.value).toEqual(1);
  });

  it("check _state and _actions", () => {
    const store = useMainStore(false);

    expect(store._state.count).toEqual(0);
    store._actions.increment();
    expect(store._state.count).toEqual(1);
    expect(store.count).toEqual(1);
    // @ts-expect-error
    expect(store._actions.count).not.toBeDefined();
    // @ts-expect-error
    expect(store._state.increment).not.toBeDefined();
  });
});
