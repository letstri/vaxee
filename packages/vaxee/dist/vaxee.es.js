import { ref, hasInjectionContext, inject, toRefs, toRef, reactive, computed } from "vue";
const IS_DEV = process.env.NODE_ENV !== "production";
const vaxeeSymbol = Symbol("vaxee");
let vaxeeInstance = null;
function setVaxeeInstance(instance) {
  vaxeeInstance = instance;
}
const getVaxeeInstance = () => vaxeeInstance;
function createVaxee() {
  const vaxee = {
    install(app) {
      setVaxeeInstance(vaxee);
      app.provide(vaxeeSymbol, vaxee);
      if (IS_DEV && typeof window !== "undefined") {
        console.log(
          "[🌱 vaxee]: Store successfully installed. Enjoy! Also you can check current Vaxee state by using a `$vaxee` property in the `window`."
        );
        window.$vaxee = vaxee.state;
      }
    },
    state: ref({}),
    _stores: {}
  };
  return vaxee;
}
function parseStore(store, context) {
  return Object.entries(store).reduce(
    (acc, [key, value]) => {
      if (typeof value === "function") {
        acc.actions[key] = context ? value.bind(context) : value;
      } else {
        acc.state[key] = value;
      }
      return acc;
    },
    {
      state: {},
      actions: {}
    }
  );
}
function defineStore(name, store) {
  const vaxee = getVaxeeInstance();
  if (vaxee == null ? void 0 : vaxee._stores[name]) {
    if (IS_DEV) {
      console.warn(
        `[🌱 vaxee]: The store with name ${name} already exists. This warning appears only in dev mode.`
      );
    }
  }
  function useStore(getterOrNameOrToRefs) {
    var _a, _b;
    const hasContext = hasInjectionContext();
    const vaxee2 = hasContext ? inject(vaxeeSymbol) : getVaxeeInstance();
    if (!vaxee2) {
      throw new Error(
        "[🌱 vaxee]: Seems like you forgot to install the plugin"
      );
    }
    const getter = typeof getterOrNameOrToRefs === "function" ? getterOrNameOrToRefs : void 0;
    const getterSetter = typeof getterOrNameOrToRefs === "object" && "get" in getterOrNameOrToRefs && "set" in getterOrNameOrToRefs ? getterOrNameOrToRefs : void 0;
    const propName = typeof getterOrNameOrToRefs === "string" ? getterOrNameOrToRefs : void 0;
    const refs = getterOrNameOrToRefs === true;
    const { state: initialState, actions } = parseStore(
      store(),
      vaxee2.state.value[name]
    );
    (_a = vaxee2.state.value)[name] || (_a[name] = initialState);
    const $state = vaxee2.state.value[name];
    (_b = vaxee2._stores)[name] || (_b[name] = {
      ...toRefs(vaxee2.state.value[name]),
      ...actions,
      $state,
      $actions: actions,
      $reset() {
        this.$state = parseStore(store(), null).state;
      }
    });
    Object.defineProperty(vaxee2._stores[name], "$state", {
      get: () => vaxee2.state.value[name],
      set: (state) => {
        Object.assign($state, state);
      }
    });
    const _store = vaxee2._stores[name];
    if (getter) {
      const _getter = toRef(() => getter(reactive(_store)));
      return typeof _getter.value === "function" ? _getter.value.bind(_store) : _getter;
    }
    if (getterSetter) {
      return computed({
        get: () => getterSetter.get(_store.$state),
        set: (value) => getterSetter.set(_store.$state, value)
      });
    }
    if (propName) {
      if (typeof _store[propName] === "function") {
        return _store[propName].bind(_store);
      }
      return computed({
        get: () => $state[propName],
        set: (value) => {
          $state[propName] = value;
        }
      });
    }
    if (refs) {
      return _store;
    }
    return reactive(_store);
  }
  return useStore;
}
const exclude = (obj, fields) => Object.fromEntries(
  Object.entries(obj).filter(([key]) => !fields.includes(key))
);
function useVaxeeDebug() {
  const vaxee = inject(vaxeeSymbol);
  if (!vaxee) {
    throw new Error(
      "[🌱 vaxee]: `useVaxeeDebug` must be used after Vaxee plugin installation."
    );
  }
  return exclude(vaxee, ["install"]);
}
export {
  createVaxee,
  defineStore,
  setVaxeeInstance,
  useVaxeeDebug
};
