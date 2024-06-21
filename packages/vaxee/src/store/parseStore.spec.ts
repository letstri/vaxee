import { describe, it, expect, beforeEach } from "vitest";
import { parseStore } from "./parseStore";

describe("parseStore", () => {
  const baseStore = {
    count: 0,
    increment() {
      this.count++;
    },
  };

  beforeEach(() => {
    baseStore.count = 0;
  });

  it("split store into state and actions", () => {
    const { state, actions } = parseStore(baseStore, null);

    expect(state).toEqual({
      count: 0,
    });
    expect(actions).toEqual({
      increment: baseStore.increment,
    });
  });

  it("save actions from the original object", () => {
    const { actions } = parseStore(baseStore, null);

    expect(actions.increment).toBe(baseStore.increment);
  });

  it("save context in actions", () => {
    const { actions, state } = parseStore(baseStore, baseStore);

    actions.increment();

    expect(baseStore.count).toBe(1);

    const { actions: actions2 } = parseStore(baseStore, state);

    actions2.increment();

    expect(state.count).toBe(1);
  });
});
