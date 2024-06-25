import { describe, it, expect, beforeEach } from "vitest";
import { parseStore } from "./parseStore";
import { state } from "./reactivity";

describe("parseStore", () => {
  const baseStore = {
    count: state(0),
    increment() {},
  };

  beforeEach(() => {
    baseStore.count.value = 0;
  });

  it("split store into state and actions", () => {
    const { states, actions } = parseStore(baseStore);

    expect(states.count.value).toEqual(0);
    expect(actions).toEqual({
      increment: baseStore.increment,
    });
  });

  it("save actions from the original object", () => {
    const { actions } = parseStore(baseStore);

    expect(actions.increment).toBe(baseStore.increment);
  });
});
