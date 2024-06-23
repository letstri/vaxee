var vaxee = function(exports, vue2) {
  "use strict";
  const IS_DEV = process.env.NODE_ENV !== "production";
  const IS_CLIENT = typeof window !== "undefined";
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
        if (IS_DEV && IS_CLIENT) {
          window.$vaxee = vaxee2.state;
        }
      },
      state: vue2.ref({}),
      _stores: vue2.ref({})
    };
    return vaxee2;
  }
  function parseStore(store) {
    return Object.entries(store).reduce(
      (acc, [key, value]) => {
        if (typeof value === "function") {
          acc.actions[key] = value;
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
  function useVaxee() {
    const hasContext = vue2.hasInjectionContext();
    const vaxee2 = hasContext ? vue2.inject(vaxeeSymbol) : getVaxeeInstance();
    if (!vaxee2) {
      throw new Error("[🌱 vaxee]: Seems like you forgot to install the plugin");
    }
    return vaxee2;
  }
  function prepareStore(store, name) {
    var _a;
    const vaxee2 = useVaxee();
    if (vaxee2._stores[name]) {
      return vaxee2._stores[name];
    }
    const getter = (callback) => vue2.computed(() => callback(vaxee2.state.value[name]));
    const options = {
      getter
    };
    const { state: initialState, actions: initialActions } = parseStore(
      store(options)
    );
    (_a = vaxee2.state.value)[name] || (_a[name] = initialState);
    const actions = Object.fromEntries(
      Object.entries(initialActions).map(([key, func]) => [
        key,
        func.bind(vaxee2.state.value[name])
      ])
    );
    vaxee2._stores[name] = {
      ...vue2.toRefs(vaxee2.state.value[name]),
      ...actions,
      $state: vaxee2.state.value[name],
      $actions: actions,
      $reset() {
        this.$state = parseStore(store(options)).state;
      }
    };
    Object.defineProperty(vaxee2._stores[name], "$state", {
      get: () => vaxee2.state.value[name],
      set: (state) => {
        Object.assign(vaxee2.state.value[name], state);
      }
    });
    return vaxee2._stores[name];
  }
  function defineStore(name, store) {
    var _a;
    if ((_a = getVaxeeInstance()) == null ? void 0 : _a._stores[name]) {
      if (IS_DEV) {
        console.warn(`[🌱 vaxee]: The store with name ${name} already exists.`);
      }
    }
    function useStore(getterOrNameOrToRefs) {
      const getter = typeof getterOrNameOrToRefs === "function" ? getterOrNameOrToRefs : void 0;
      const getterSetter = typeof getterOrNameOrToRefs === "object" && "get" in getterOrNameOrToRefs && "set" in getterOrNameOrToRefs ? getterOrNameOrToRefs : void 0;
      const propName = typeof getterOrNameOrToRefs === "string" ? getterOrNameOrToRefs : void 0;
      const refs = getterOrNameOrToRefs === true;
      const _store = prepareStore(store, name);
      if (getter) {
        const _getter = vue2.toRef(() => getter(vue2.reactive(_store)));
        return typeof _getter.value === "function" ? _getter.value.bind(_store.$state) : _getter;
      }
      if (getterSetter) {
        return vue2.computed({
          get: () => getterSetter.get(_store.$state),
          set: (value) => getterSetter.set(_store.$state, value)
        });
      }
      if (propName) {
        if (typeof _store[propName] === "function") {
          return _store[propName].bind(_store.$state);
        }
        return vue2.computed({
          get: () => _store.$state[propName],
          set: (value) => {
            _store.$state[propName] = value;
          }
        });
      }
      if (refs) {
        return _store;
      }
      return vue2.reactive(_store);
    }
    useStore._store = name;
    return useStore;
  }
  exports.createVaxee = createVaxee;
  exports.defineStore = defineStore;
  exports.setVaxeeInstance = setVaxeeInstance;
  exports.useVaxee = useVaxee;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({}, vue);
