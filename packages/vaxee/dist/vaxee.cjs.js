"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const vue = require("vue");
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
        window.$vaxee = vaxee;
      }
    },
    state: vue.ref({}),
    _stores: {}
  };
  return vaxee;
}
function useVaxee() {
  const hasContext = vue.hasInjectionContext();
  const vaxee = hasContext ? vue.inject(vaxeeSymbol) : getVaxeeInstance();
  if (!vaxee) {
    throw new Error(
      VAXEE_LOG_START + "Seems like you forgot to install the plugin"
    );
  }
  return vaxee;
}
const stateSymbol = Symbol("vaxee-state");
const getterSymbol = Symbol("vaxee-getter");
const state = (value) => {
  const _ref = vue.ref(value);
  _ref._vaxee = stateSymbol;
  return _ref;
};
const isState = (ref2) => (ref2 == null ? void 0 : ref2._vaxee) === stateSymbol;
const getter = (fn) => {
  const ref2 = vue.computed(() => fn());
  ref2._vaxee = getterSymbol;
  return ref2;
};
const isGetter = (ref2) => (ref2 == null ? void 0 : ref2._vaxee) === getterSymbol;
function parseStore(store) {
  return Object.entries(store).reduce(
    (acc, [key, value]) => {
      if (isState(value)) {
        acc.states[key] = value;
      } else if (isGetter(value)) {
        acc.getters[key] = value;
      } else if (typeof value === "function") {
        acc.actions[key] = value;
      } else {
        acc.other[key] = vue.unref(value);
      }
      return acc;
    },
    {
      states: {},
      actions: {},
      getters: {},
      other: {}
    }
  );
}
function prepareStore(name, store) {
  const vaxee = useVaxee();
  if (vaxee._stores[name]) {
    return vaxee._stores[name];
  }
  const { states, actions, getters, other } = parseStore(store);
  if (vaxee.state.value[name]) {
    for (const key in states) {
      states[key].value = vaxee.state.value[name][key];
    }
  }
  vaxee.state.value[name] = states;
  vaxee._stores[name] = {
    ...actions,
    ...getters,
    ...vue.toRefs(vaxee.state.value[name]),
    ...other,
    _state: vaxee.state.value[name],
    _actions: actions,
    _getters: getters,
    _other: other
  };
  Object.defineProperty(vaxee._stores[name], "_state", {
    get: () => vaxee.state.value[name],
    set: (state2) => {
      Object.assign(vaxee.state.value[name], state2);
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
  function use(getterOrNameOrToRefs) {
    const getterParam = typeof getterOrNameOrToRefs === "function" ? getterOrNameOrToRefs : void 0;
    const getterSetter = typeof getterOrNameOrToRefs === "object" && "get" in getterOrNameOrToRefs && "set" in getterOrNameOrToRefs ? getterOrNameOrToRefs : void 0;
    const propName = typeof getterOrNameOrToRefs === "string" ? getterOrNameOrToRefs : void 0;
    const refs = getterOrNameOrToRefs === true || getterOrNameOrToRefs === void 0;
    const _store = prepareStore(name, store({ state, getter }));
    if (getterParam) {
      const _getter = vue.computed(
        () => (
          // @ts-ignore
          getterParam(vue.reactive(_store))
        )
      );
      return typeof _getter.value === "function" ? _getter.value : _getter;
    }
    if (getterSetter) {
      return vue.computed({
        get: () => getterSetter.get(_store._state),
        set: (value) => getterSetter.set(_store._state, value)
      });
    }
    if (propName) {
      if (_store._actions[propName]) {
        return _store._actions[propName];
      }
      if (_store._getters[propName]) {
        return _store._getters[propName];
      }
      if (_store._other[propName]) {
        return _store._other[propName];
      }
      return vue.computed({
        get: () => _store._state[propName],
        set: (value) => {
          _store._state[propName] = value;
        }
      });
    }
    if (refs) {
      return _store;
    }
    return vue.reactive(_store);
  }
  use.$stateInfer = {};
  return use;
};
exports.createStore = createStore;
exports.createVaxeePlugin = createVaxeePlugin;
exports.setVaxeeInstance = setVaxeeInstance;
exports.useVaxee = useVaxee;
