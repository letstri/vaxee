import { describe, it, expect } from "vitest";
import { computed, ref } from "vue";
import { getter, isGetter, isState, state } from "./reactivity";

describe("reactivity", () => {
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
});
