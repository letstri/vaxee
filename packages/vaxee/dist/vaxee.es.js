import { ref, hasInjectionContext, inject, toRefs, computed, toRef, reactive } from "vue";
const IS_DEV = process.env.NODE_ENV !== "production";
const IS_CLIENT = typeof window !== "undefined";
const VAXEE_LOG_START = "[🌱 vaxee]: ";
const vaxeeSymbol = Symbol("vaxee");
let vaxeeInstance = null;
function setVaxeeInstance(instance) {
  vaxeeInstance = instance;
}
const getVaxeeInstance = () => vaxeeInstance;
function createVaxeePlugin() {
  const vaxee = {
    install(app) {
      setVaxeeInstance(vaxee);
      app.provide(vaxeeSymbol, vaxee);
      if (IS_DEV && IS_CLIENT) {
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
function useVaxee() {
  const hasContext = hasInjectionContext();
  const vaxee = hasContext ? inject(vaxeeSymbol) : getVaxeeInstance();
  if (!vaxee) {
    throw new Error(
      VAXEE_LOG_START + "Seems like you forgot to install the plugin"
    );
  }
  return vaxee;
}
function prepareStore(store, name) {
  var _a;
  const vaxee = useVaxee();
  if (vaxee._stores[name]) {
    return vaxee._stores[name];
  }
  const getter = (callback) => computed(() => callback(vaxee.state.value[name]));
  const options = {
    getter
  };
  const { state: initialState, actions } = parseStore(store(options));
  (_a = vaxee.state.value)[name] || (_a[name] = initialState);
  vaxee._stores[name] = {
    ...toRefs(vaxee.state.value[name]),
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
const createStore = (name, store) => {
  var _a;
  if ((_a = getVaxeeInstance()) == null ? void 0 : _a._stores[name]) {
    if (IS_DEV) {
      console.warn(
        VAXEE_LOG_START + `The store with name ${name} already exists.`
      );
    }
  }
  function useStore(getterOrNameOrToRefs) {
    const getter = typeof getterOrNameOrToRefs === "function" ? getterOrNameOrToRefs : void 0;
    const getterSetter = typeof getterOrNameOrToRefs === "object" && "get" in getterOrNameOrToRefs && "set" in getterOrNameOrToRefs ? getterOrNameOrToRefs : void 0;
    const propName = typeof getterOrNameOrToRefs === "string" ? getterOrNameOrToRefs : void 0;
    const refs = getterOrNameOrToRefs === true;
    const _store = prepareStore(store, name);
    if (getter) {
      const _getter = toRef(() => getter(reactive(_store)));
      return typeof _getter.value === "function" ? _getter.value : _getter;
    }
    if (getterSetter) {
      return computed({
        get: () => getterSetter.get(_store.$state),
        set: (value) => getterSetter.set(_store.$state, value)
      });
    }
    if (propName) {
      if (typeof _store[propName] === "function") {
        return _store[propName];
      }
      return computed({
        get: () => _store.$state[propName],
        set: (value) => {
          _store.$state[propName] = value;
        }
      });
    }
    if (refs) {
      return _store;
    }
    return reactive(_store);
  }
  useStore._store = name;
  return useStore;
};
export {
  createStore,
  createVaxeePlugin,
  setVaxeeInstance,
  useVaxee
};
