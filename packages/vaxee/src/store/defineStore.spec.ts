import { beforeEach, describe, it, expect, vi } from "vitest";
import { createVaxee, defineStore, setVaxeeInstance } from "..";
import { mount } from "@vue/test-utils";
import { defineComponent, getCurrentInstance, nextTick, watch } from "vue";
import { getVaxeeInstance } from "../plugin";

describe("defineStore", () => {
  beforeEach(() => {
    setVaxeeInstance(createVaxee());
  });

  it("can create an empty store", () => {
    const store = defineStore("store", () => ({}))();

    expect(store.$state).toEqual({});
    expect(store.$actions).toEqual({});
  });

  it("reuses the same store", () => {
    const useStore = defineStore("store", () => ({
      test: 123,
    }));

    expect(useStore()).toBe(useStore());
  });

  it("the same as the original store", () => {
    const useStore = defineStore("store", () => ({
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
    const useStore = defineStore("main", () => ({
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
      global: { plugins: [getVaxeeInstance()!] },
    });
    const component2 = mount(TestComponent, {
      global: { plugins: [getVaxeeInstance()!] },
    });

    expect(component1.text()).toBe("0");
    expect(component2.text()).toBe("0");

    component1.vm.store.count++;
    await component1.vm.$nextTick();

    expect(component1.text()).toBe("1");
    expect(component2.text()).toBe("1");
  });

  it("can hydrate the state", () => {
    const vaxee = getVaxeeInstance()!;
    const useStore = defineStore("store", () => ({
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
    const useStore = defineStore("store", () => ({
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
    const useStore = defineStore("main", () => ({
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
    const vaxee = createVaxee();
    const useStore = defineStore("store", () => ({
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
          plugins: [vaxee],
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
    const useStore = defineStore("store", () => ({
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
          plugins: [createVaxee()],
        },
      }
    );

    expect(i1 === i2).toBe(true);

    wrapper.unmount();
  });

  it("reuses stores from parent components", () => {
    let s1, s2;
    const useStore = defineStore("store", () => ({
      n: 0,
    }));
    const vaxee = createVaxee();

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
      { global: { plugins: [vaxee] } }
    );

    expect(s1).toBeDefined();
    expect(s1 === s2).toBe(true);
  });

  it("can share the same pinia in two completely different instances", async () => {
    const useStore = defineStore("store", () => ({
      n: 0,
    }));
    const vaxee = createVaxee();

    const Comp = defineComponent({
      setup() {
        const store = useStore();
        return { store };
      },
      template: `{{ store.n }}`,
    });

    const One = mount(Comp, {
      global: {
        plugins: [vaxee],
      },
    });

    const Two = mount(Comp, {
      global: {
        plugins: [vaxee],
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
