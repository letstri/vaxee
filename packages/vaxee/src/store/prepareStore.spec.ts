import { describe, it, expect } from "vitest";
import { createVaxee, getVaxeeInstance, setVaxeeInstance } from "../plugin";
import { prepareStore } from "./prepareStore";

describe("prepareStore", () => {
  it("should save state and actions into the instance", () => {
    setVaxeeInstance(createVaxee());

    const vaxee = getVaxeeInstance()!;

    const store = () => ({
      count: 0,
      increment() {
        this.count++;
      },
    });

    const name = "store";

    prepareStore(store, name);

    expect(vaxee.state.value[name].count).toBe(0);
    // @ts-expect-error
    expect(vaxee._stores[name].increment).toBeDefined();
    // @ts-expect-error
    expect(vaxee._stores[name].$state.count).toBe(0);
    // @ts-expect-error
    expect(vaxee._stores[name].$actions.increment).toBeDefined();
  });

  it("should reset store state", () => {
    setVaxeeInstance(createVaxee());

    const vaxee = getVaxeeInstance()!;

    const store = () => ({
      count: 0,
      increment() {
        this.count++;
      },
    });

    const name = "store";

    prepareStore(store, name);

    // @ts-expect-error
    vaxee._stores[name].increment.call(vaxee.state.value[name]);
    // @ts-expect-error
    expect(vaxee._stores[name].$state.count).toBe(1);

    vaxee._stores[name].$reset();
    // @ts-expect-error
    expect(vaxee._stores[name].$state.count).toBe(0);
  });
});
