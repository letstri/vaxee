import { beforeEach, describe, it, expect, vi } from "vitest";
import { createVaxeePlugin, createStore, setVaxeeInstance } from "..";
import { mount } from "@vue/test-utils";
import { defineComponent, getCurrentInstance, nextTick, watch } from "vue";
import { useVaxee } from "../composables/useVaxee";

/**
 * Some test was taken from pinia to better quality of the code.
 *
 * @see https://github.com/vuejs/pinia/blob/v2/packages/pinia/__tests__/store.spec.ts
 */

describe("createStore", () => {
  beforeEach(() => {
    setVaxeeInstance(createVaxeePlugin());
  });

  it("can create an empty store", () => {
    const store = createStore("store", () => ({}))();

    expect(store._state).toEqual({});
    expect(store._actions).toEqual({});
  });

  it("reuses the same store", () => {
    const useStore = createStore("store", ({ state }) => {
      const test = state(123);

      const increment = () => {
        test.value++;
      };

      return {
        test,
        increment,
      };
    });

    expect(useStore()).toBe(useStore());
  });

  it("the same as the original store", () => {
    const useStore = createStore("store", ({ state }) => {
      const test = state({
        a: 123,
      });

      return { test };
    });

    const store = useStore();

    expect(store._state).toEqual({
      test: {
        a: 123,
      },
    });
  });

  it("render and increment count in components", async () => {
    const useStore = createStore("main", ({ state }) => {
      const count = state(0);

      return { count };
    });
    const TestComponent = defineComponent({
      template: `<div>{{ store.count }}</div>`,
      setup() {
        const store = useStore(false);
        return { store };
      },
    });
    const component1 = mount(TestComponent, {
      global: { plugins: [useVaxee()] },
    });
    const component2 = mount(TestComponent, {
      global: { plugins: [useVaxee()] },
    });

    expect(component1.text()).toBe("0");
    expect(component2.text()).toBe("0");

    component1.vm.store.count++;
    await nextTick();

    expect(component1.text()).toBe("1");
    expect(component2.text()).toBe("1");
  });

  it("can hydrate the state", () => {
    const vaxee = useVaxee();
    const useStore = createStore("store", ({ state }) => {
      const a = state(true);
      const nested = state({
        foo: "foo",
        a: { b: "string" },
      });

      return { a, nested };
    });

    vaxee.state.value.store = {
      a: false,
      nested: {
        foo: "bar",
        a: { b: "string 2" },
      },
    } satisfies typeof useStore.$inferState;

    const store = useStore();

    expect(store._state).toEqual({
      a: false,
      nested: {
        foo: "bar",
        a: { b: "string 2" },
      },
    });
  });

  it("can reassign _state", () => {
    const useStore = createStore("store", ({ state }) => {
      const a = state(true);
      const nested = state({
        foo: "foo",
        a: { b: "string" },
      });

      return {
        a,
        nested,
      };
    });

    const store = useStore(false);
    const spy = vi.fn();
    watch(() => store.a, spy, { flush: "sync" });
    expect(store.a).toBe(true);

    expect(spy).toHaveBeenCalledTimes(0);

    store._state = {
      a: false,
      nested: {
        foo: "bar",
        a: {
          b: "hey",
        },
      },
    };

    expect(spy).toHaveBeenCalledTimes(1);

    expect(store._state).toEqual({
      a: false,
      nested: {
        foo: "bar",
        a: { b: "hey" },
      },
    });
    expect(store.a).toBe(false);
  });

  it("should outlive components", async () => {
    const useStore = createStore("store", ({ state }) => {
      const n = state(0);

      return { n };
    });

    const wrapper = mount(
      {
        setup() {
          const store = useStore();

          return { store };
        },

        template: `n: {{ store.n }}`,
      },
      {
        global: {
          plugins: [useVaxee()],
        },
      }
    );

    expect(wrapper.html()).toBe("n: 0");

    const { n } = useStore();

    const spy = vi.fn();
    watch(n, spy);

    expect(spy).toHaveBeenCalledTimes(0);
    n.value++;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(wrapper.html()).toBe("n: 1");

    wrapper.unmount();
    await nextTick();
    n.value++;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("should not break getCurrentInstance", () => {
    const useStore = createStore("store", ({ state }) => {
      const n = state(0);

      return { n };
    });
    let store: any;

    let i1: any = {};
    let i2: any = {};
    const wrapper = mount(
      {
        setup() {
          i1 = getCurrentInstance();
          store = useStore();
          i2 = getCurrentInstance();

          return { store };
        },

        template: `a: {{ store.a }}`,
      },
      {
        global: {
          plugins: [useVaxee()],
        },
      }
    );

    expect(i1 === i2).toBe(true);

    wrapper.unmount();
  });

  it("reuses stores from parent components", () => {
    let s1, s2;
    const useStore = createStore("store", ({ state }) => {
      const n = state(0);

      return { n };
    });
    const Child = defineComponent({
      setup() {
        s2 = useStore();
      },
      template: `child`,
    });

    mount(
      {
        setup() {
          s1 = useStore();
          return { s1 };
        },
        components: { Child },
        template: `<child/>`,
      },
      { global: { plugins: [useVaxee()] } }
    );

    expect(s1).toBeDefined();
    expect(s1 === s2).toBe(true);
  });

  it("can share the same vaxee in two completely different instances", async () => {
    const useStore = createStore("store", ({ state }) => {
      const n = state(0);

      return { n };
    });

    const Comp = defineComponent({
      setup() {
        const store = useStore();
        return { store };
      },
      template: `{{ store.n }}`,
    });

    const One = mount(Comp, {
      global: {
        plugins: [useVaxee()],
      },
    });

    const Two = mount(Comp, {
      global: {
        plugins: [useVaxee()],
      },
    });

    const { n } = useStore();

    expect(One.text()).toBe("0");
    expect(Two.text()).toBe("0");

    n.value++;
    await nextTick();

    expect(One.text()).toBe("1");
    expect(Two.text()).toBe("1");
  });
});
