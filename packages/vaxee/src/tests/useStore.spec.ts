import { beforeEach, describe, it, expect } from "vitest";
import { createVaxeePlugin, createStore, setVaxeeInstance } from "..";

describe("useStore", () => {
  beforeEach(() => {
    setVaxeeInstance(createVaxeePlugin());
  });

  const useMainStore = createStore("main", ({ state, getter }) => {
    const count = state(0);

    const increment = (_count?: number) => {
      count.value += _count || 1;
    };

    const double = getter(() => count.value * 2);

    return {
      count,
      simple: 100,
      increment,
      double,
    };
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
    expect(store.simple).toEqual(100);
  });

  it("can use store with destructuring", () => {
    const { count, increment, double, simple } = useMainStore();

    expect(count.value).toEqual(0);
    count.value++;
    expect(count.value).toEqual(1);
    increment();
    expect(count.value).toEqual(2);
    expect(double.value).toEqual(4);
    expect(simple).toEqual(100);
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

  it("check _state and _actions", () => {
    const store = useMainStore(false);

    // @ts-expect-error
    expect(store._state.count).toEqual(0);
    // @ts-expect-error
    store._actions.increment();
    // @ts-expect-error
    expect(store._state.count).toEqual(1);
    expect(store.count).toEqual(1);
    // @ts-expect-error
    expect(store._actions.count).not.toBeDefined();
    // @ts-expect-error
    expect(store._state.increment).not.toBeDefined();
  });
});
