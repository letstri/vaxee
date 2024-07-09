import { describe, it, expect, beforeEach, expectTypeOf } from "vitest";
import { computed, isShallow, ref } from "vue";
import { getter, isGetter, isState, state } from "./reactivity";
import { createVaxee, setVaxeeInstance } from "../plugin";

describe("reactivity", () => {
  beforeEach(() => {
    setVaxeeInstance(createVaxee());
  });

  it("check is our reactivity", () => {
    const vueRef = ref(0);
    const vueComputed = computed(() => vueRef.value * 2);
    const count = state(0);
    const double = getter(() => count.value * 2);

    expect(count.value).toBe(0);
    expect(double.value).toBe(0);

    count.value = 1;

    expect(count.value).toBe(1);
    expect(double.value).toBe(2);

    expect(isState(count)).toBe(true);
    expect(isGetter(double)).toBe(true);

    expect(isState(vueRef)).toBe(false);
    expect(isGetter(vueComputed)).toBe(false);
  });

  it("check shallow state", () => {
    expect(isShallow(state({}, { shallow: true }))).toBe(true);
  });
});
