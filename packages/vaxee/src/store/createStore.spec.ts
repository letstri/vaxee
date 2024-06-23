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

    expect(store.$state).toEqual({});
    expect(store.$actions).toEqual({});
  });

  it("reuses the same store", () => {
    const useStore = createStore("store", () => ({
      test: 123,
    }));

    expect(useStore()).toBe(useStore());
  });

  it("the same as the original store", () => {
    const useStore = createStore("store", () => ({
      test: {
        a: 123,
      },
    }));

    const store = useStore();

    expect(store.$state).toEqual({
      test: {
        a: 123,
      },
    });
  });

  it("render and increment count in components", async () => {
    const useStore = createStore("main", () => ({
      count: 0,
    }));
    const TestComponent = defineComponent({
      template: `<div>{{ store.count }}</div>`,
      setup() {
        const store = useStore();
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
    const useStore = createStore("store", () => ({
      a: true,
      nested: {
        foo: "foo",
        a: { b: "string" },
      },
    }));

    vaxee.state.value.store = {
      a: false,
      nested: {
        foo: "bar",
        a: { b: "string 2" },
      },
    };

    const store = useStore();

    expect(store.$state).toEqual({
      a: false,
      nested: {
        foo: "bar",
        a: { b: "string 2" },
      },
    });
  });

  it("can reassign $state", () => {
    const useStore = createStore("store", () => ({
      a: true,
      nested: {
        foo: "foo",
        a: { b: "string" },
      },
    }));

    const store = useStore();
    const spy = vi.fn();
    watch(() => store.a, spy, { flush: "sync" });
    expect(store.a).toBe(true);

    expect(spy).toHaveBeenCalledTimes(0);

    store.$state = {
      a: false,
      nested: {
        foo: "bar",
        a: {
          b: "hey",
        },
      },
    };

    expect(spy).toHaveBeenCalledTimes(1);

    expect(store.$state).toEqual({
      a: false,
      nested: {
        foo: "bar",
        a: { b: "hey" },
      },
    });
    expect(store.a).toBe(false);
  });

  it("can be reset", () => {
    const useStore = createStore("main", () => ({
      count: 0,
      count2: 10,
    }));
    const store = useStore();

    store.count = 1;
    store.$reset();
    expect(store.count).toBe(0);

    store.count2 = 20;
    expect(store.$state).toEqual({
      count: 0,
      count2: 20,
    });
  });

  it("should outlive components", async () => {
    const useStore = createStore("store", () => ({
      n: 0,
    }));

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

    const store = useStore();

    const spy = vi.fn();
    watch(() => store.n, spy);

    expect(spy).toHaveBeenCalledTimes(0);
    store.n++;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(wrapper.html()).toBe("n: 1");

    wrapper.unmount();
    await nextTick();
    store.n++;
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("should not break getCurrentInstance", () => {
    const useStore = createStore("store", () => ({
      n: 0,
    }));
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
    const useStore = createStore("store", () => ({
      n: 0,
    }));
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
    const useStore = createStore("store", () => ({
      n: 0,
    }));

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

    const store = useStore();

    expect(One.text()).toBe("0");
    expect(Two.text()).toBe("0");

    store.n++;
    await nextTick();

    expect(One.text()).toBe("1");
    expect(Two.text()).toBe("1");
  });
});
