import { describe, it, expect, beforeEach } from "vitest";
import { parseStore } from "./parseStore";

describe("parseStore", () => {
  const baseStore = {
    count: 0,
    increment() {},
  };

  beforeEach(() => {
    baseStore.count = 0;
  });

  it("split store into state and actions", () => {
    const { state, actions } = parseStore(baseStore);

    expect(state).toEqual({
      count: 0,
    });
    expect(actions).toEqual({
      increment: baseStore.increment,
    });
  });

  it("save actions from the original object", () => {
    const { actions } = parseStore(baseStore);

    expect(actions.increment).toBe(baseStore.increment);
  });
});
