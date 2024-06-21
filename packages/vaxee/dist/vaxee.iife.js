var vaxee = function(exports, vue2) {
  "use strict";
  const IS_DEV = process.env.NODE_ENV !== "production";
  const vaxeeSymbol = Symbol("vaxee");
  let vaxeeInstance = null;
  function setVaxeeInstance(instance) {
    vaxeeInstance = instance;
  }
  const getVaxeeInstance = () => vaxeeInstance;
  function createVaxee() {
    const vaxee2 = {
      install(app) {
        setVaxeeInstance(vaxee2);
        app.provide(vaxeeSymbol, vaxee2);
        if (IS_DEV && typeof window !== "undefined") {
          console.log(
            "[🌱 vaxee]: Store successfully installed. Enjoy! Also you can check current Vaxee state by using a `$vaxee` property in the `window`."
          );
          window.$vaxee = vaxee2.state;
        }
      },
      state: vue2.ref({}),
      _stores: {}
    };
    return vaxee2;
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
    const vaxee2 = getVaxeeInstance();
    if (vaxee2 == null ? void 0 : vaxee2._stores[name]) {
      if (IS_DEV) {
        console.warn(
          `[🌱 vaxee]: The store with name ${name} already exists. This warning appears only in dev mode.`
        );
      }
    }
    function useStore(getterOrNameOrToRefs) {
      var _a, _b;
      const hasContext = vue2.hasInjectionContext();
      const vaxee22 = hasContext ? vue2.inject(vaxeeSymbol) : getVaxeeInstance();
      if (!vaxee22) {
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
        vaxee22.state.value[name]
      );
      (_a = vaxee22.state.value)[name] || (_a[name] = initialState);
      const $state = vaxee22.state.value[name];
      (_b = vaxee22._stores)[name] || (_b[name] = {
        ...vue2.toRefs(vaxee22.state.value[name]),
        ...actions,
        $state,
        $actions: actions,
        $reset() {
          this.$state = parseStore(store(), null).state;
        }
      });
      Object.defineProperty(vaxee22._stores[name], "$state", {
        get: () => vaxee22.state.value[name],
        set: (state) => {
          Object.assign($state, state);
        }
      });
      const _store = vaxee22._stores[name];
      if (getter) {
        const _getter = vue2.toRef(() => getter(vue2.reactive(_store)));
        return typeof _getter.value === "function" ? _getter.value.bind(_store) : _getter;
      }
      if (getterSetter) {
        return vue2.computed({
          get: () => getterSetter.get(_store.$state),
          set: (value) => getterSetter.set(_store.$state, value)
        });
      }
      if (propName) {
        if (typeof _store[propName] === "function") {
          return _store[propName].bind(_store);
        }
        return vue2.computed({
          get: () => $state[propName],
          set: (value) => {
            $state[propName] = value;
          }
        });
      }
      if (refs) {
        return _store;
      }
      return vue2.reactive(_store);
    }
    return useStore;
  }
  const exclude = (obj, fields) => Object.fromEntries(
    Object.entries(obj).filter(([key]) => !fields.includes(key))
  );
  function useVaxeeDebug() {
    const vaxee2 = vue2.inject(vaxeeSymbol);
    if (!vaxee2) {
      throw new Error(
        "[🌱 vaxee]: `useVaxeeDebug` must be used after Vaxee plugin installation."
      );
    }
    return exclude(vaxee2, ["install"]);
  }
  exports.createVaxee = createVaxee;
  exports.defineStore = defineStore;
  exports.setVaxeeInstance = setVaxeeInstance;
  exports.useVaxeeDebug = useVaxeeDebug;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({}, vue);
