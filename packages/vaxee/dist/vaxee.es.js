import { ref, toRefs, hasInjectionContext, inject, toRef, reactive, computed } from "vue";
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
        window.$vaxee = vaxee.state;
      }
    },
    state: ref({}),
    _stores: {}
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
function prepareStore(store, name) {
  var _a, _b;
  const vaxee = getVaxeeInstance();
  const { state: initialState, actions: initialActions } = parseStore(store());
  (_a = vaxee.state.value)[name] || (_a[name] = initialState);
  const actions = Object.fromEntries(
    Object.entries(initialActions).map(([key, func]) => [
      key,
      func.bind(vaxee.state.value[name])
    ])
  );
  (_b = vaxee._stores)[name] || (_b[name] = {
    ...toRefs(vaxee.state.value[name]),
    ...actions,
    $state: vaxee.state.value[name],
    $actions: actions,
    $reset() {
      this.$state = parseStore(store()).state;
    }
  });
  Object.defineProperty(vaxee._stores[name], "$state", {
    get: () => vaxee.state.value[name],
    set: (state) => {
      Object.assign(vaxee.state.value[name], state);
    }
  });
}
function defineStore(name, store) {
  var _a;
  if ((_a = getVaxeeInstance()) == null ? void 0 : _a._stores[name]) {
    if (IS_DEV) {
      console.warn(`[🌱 vaxee]: The store with name ${name} already exists.`);
    }
  }
  function useStore(getterOrNameOrToRefs) {
    const hasContext = hasInjectionContext();
    const vaxee = hasContext ? inject(vaxeeSymbol) : getVaxeeInstance();
    if (!vaxee) {
      throw new Error(
        "[🌱 vaxee]: Seems like you forgot to install the plugin"
      );
    }
    const getter = typeof getterOrNameOrToRefs === "function" ? getterOrNameOrToRefs : void 0;
    const getterSetter = typeof getterOrNameOrToRefs === "object" && "get" in getterOrNameOrToRefs && "set" in getterOrNameOrToRefs ? getterOrNameOrToRefs : void 0;
    const propName = typeof getterOrNameOrToRefs === "string" ? getterOrNameOrToRefs : void 0;
    const refs = getterOrNameOrToRefs === true;
    prepareStore(store, name);
    const _state = vaxee.state.value[name];
    const _store = vaxee._stores[name];
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
        get: () => _state[propName],
        set: (value) => {
          _state[propName] = value;
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
