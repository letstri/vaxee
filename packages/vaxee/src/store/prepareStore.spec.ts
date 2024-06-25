import { describe, it, expect } from "vitest";
import {
  createVaxeePlugin,
  getVaxeeInstance,
  setVaxeeInstance,
} from "../plugin";
import { prepareStore } from "./prepareStore";
import { state } from "./reactivity";

describe("prepareStore", () => {
  it("should save state and actions into the instance", () => {
    setVaxeeInstance(createVaxeePlugin());

    const vaxee = getVaxeeInstance()!;

    const store = {
      count: state(0),
      increment() {},
    };

    const name = "store";

    prepareStore(name, store);

    expect(vaxee.state.value[name].count).toBe(0);
    expect(vaxee._stores[name].increment).toBeInstanceOf(Function);
    expect(vaxee._stores[name]._state.count).toBe(0);
    expect(vaxee._stores[name]._actions.increment).toBeInstanceOf(Function);
  });
});
