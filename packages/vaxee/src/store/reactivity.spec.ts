import { describe, it, expect, beforeEach } from "vitest";
import { computed, isShallow, ref } from "vue";
import { getter, isGetter, isState, state } from "./reactivity";
import { createVaxee, setVaxeeInstance } from "../plugin";
import { mount } from "@vue/test-utils";
import { createStore } from "./createStore";
import { useVaxee } from "../composables/useVaxee";

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

  it('check "persist" string', () => {
    const useStore = createStore("store", ({ state }) => {
      const count = state(0, { persist: "count" });

      return { count };
    });

    const comp = mount(
      {
        setup() {
          const { count } = useStore();

          count.value = 1;

          return { count };
        },
        template: `<div>{{ count }}</div>`,
      },
      {
        global: {
          plugins: [useVaxee()],
        },
      }
    );

    expect(comp.text()).toBe("1");
    expect(window.localStorage.getItem("count")).toBe("1");
  });

  it('check "persist" object', () => {
    let persistedCount: number | null = null;

    const useStore = createStore("store", ({ state }) => {
      const count = state(0, {
        persist: {
          get: () => persistedCount,
          set: (value) => {
            persistedCount = value;
          },
        },
      });

      return { count };
    });

    const comp = mount(
      {
        setup() {
          const { count } = useStore();

          count.value = 1;

          return { count };
        },
        template: `<div>{{ count }}</div>`,
      },
      {
        global: {
          plugins: [useVaxee()],
        },
      }
    );

    expect(comp.text()).toBe("1");
    expect(persistedCount).toBe(1);
  });
});
