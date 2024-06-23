"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const vue = require("vue");
const IS_DEV = process.env.NODE_ENV !== "production";
const IS_CLIENT = typeof window !== "undefined";
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
      if (IS_DEV && IS_CLIENT) {
        window.$vaxee = vaxee.state;
      }
    },
    state: vue.ref({}),
    _stores: vue.ref({})
  };
  return vaxee;
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
  const hasContext = vue.hasInjectionContext();
  const vaxee = hasContext ? vue.inject(vaxeeSymbol) : getVaxeeInstance();
  if (!vaxee) {
    throw new Error("[🌱 vaxee]: Seems like you forgot to install the plugin");
  }
  return vaxee;
}
function prepareStore(store, name) {
  var _a;
  const vaxee = useVaxee();
  if (vaxee._stores[name]) {
    return vaxee._stores[name];
  }
  const getter = (callback) => vue.computed(() => callback(vaxee.state.value[name]));
  const options = {
    getter
  };
  const { state: initialState, actions: initialActions } = parseStore(
    store(options)
  );
  (_a = vaxee.state.value)[name] || (_a[name] = initialState);
  const actions = Object.fromEntries(
    Object.entries(initialActions).map(([key, func]) => [
      key,
      func.bind(vaxee.state.value[name])
    ])
  );
  vaxee._stores[name] = {
    ...vue.toRefs(vaxee.state.value[name]),
    ...actions,
    $state: vaxee.state.value[name],
    $actions: actions,
    $reset() {
      this.$state = parseStore(store(options)).state;
    }
  };
  Object.defineProperty(vaxee._stores[name], "$state", {
    get: () => vaxee.state.value[name],
    set: (state) => {
      Object.assign(vaxee.state.value[name], state);
    }
  });
  return vaxee._stores[name];
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
      const _getter = vue.toRef(() => getter(vue.reactive(_store)));
      return typeof _getter.value === "function" ? _getter.value.bind(_store.$state) : _getter;
    }
    if (getterSetter) {
      return vue.computed({
        get: () => getterSetter.get(_store.$state),
        set: (value) => getterSetter.set(_store.$state, value)
      });
    }
    if (propName) {
      if (typeof _store[propName] === "function") {
        return _store[propName].bind(_store.$state);
      }
      return vue.computed({
        get: () => _store.$state[propName],
        set: (value) => {
          _store.$state[propName] = value;
        }
      });
    }
    if (refs) {
      return _store;
    }
    return vue.reactive(_store);
  }
  useStore._store = name;
  return useStore;
}
exports.createVaxee = createVaxee;
exports.defineStore = defineStore;
exports.setVaxeeInstance = setVaxeeInstance;
exports.useVaxee = useVaxee;
