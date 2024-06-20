var vaxee = function(exports, vue2) {
  "use strict";
  let vaxeeInstance = null;
  function setVaxeeInstance(instance) {
    vaxeeInstance = instance;
  }
  const getVaxeeInstance = () => vaxeeInstance;
  function vaxeePlugin() {
    const vaxee2 = {
      install(app) {
        setVaxeeInstance(vaxee2);
        app.config.globalProperties.$vaxee = vaxee2.state;
        app.provide("vaxee", vaxee2.state);
        if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
          console.log(
            "[🌱 vaxee]: Store successfully installed. Enjoy! Also you can check current Vaxee state by using a `$vaxee` property in the `window`."
          );
          window.$vaxee = vaxee2.state;
        }
      },
      state: vue2.ref({}),
      _actions: {},
      _stores: {}
    };
    return vaxee2;
  }
  function defineStore(name, store) {
    const vaxee2 = getVaxeeInstance();
    if (vaxee2 == null ? void 0 : vaxee2._stores[name]) {
      console.log(
        `[🌱 vaxee]: Store with name "${name}" already exists. Reusing..`
      );
      return vaxee2._stores[name];
    }
    function useStore(getterOrNameOrToRefs) {
      var _a, _b;
      const vaxee22 = getVaxeeInstance();
      if (!vaxee22) {
        throw new Error(
          "[🌱 vaxee]: Seems like you forgot to install the plugin"
        );
      }
      const initialStore = store();
      const { initialState, actions } = Object.entries(initialStore).reduce(
        (acc, [key, value]) => {
          if (typeof value === "function") {
            acc.actions[key] = value.bind(
              vaxee22.state.value[name]
            );
          } else {
            acc.initialState[key] = value;
          }
          return acc;
        },
        {
          initialState: {},
          actions: {}
        }
      );
      (_a = vaxee22.state.value)[name] || (_a[name] = initialState);
      (_b = vaxee22._actions)[name] || (_b[name] = actions);
      const _state = vaxee22.state.value[name];
      const _stateAndActions = { ...vue2.toRefs(_state), ...actions };
      const getter = typeof getterOrNameOrToRefs === "function" ? getterOrNameOrToRefs : void 0;
      const getterSetter = typeof getterOrNameOrToRefs === "object" ? getterOrNameOrToRefs : void 0;
      const propName = typeof getterOrNameOrToRefs === "string" ? getterOrNameOrToRefs : void 0;
      const refs = getterOrNameOrToRefs === true;
      if (getter) {
        const _getter = vue2.toRef(() => getter(vue2.reactive(_stateAndActions)));
        return typeof _getter.value === "function" ? vue2.unref(_getter).bind(_state) : _getter;
      }
      if (getterSetter) {
        return vue2.computed({
          get: () => getterSetter.get(_state),
          set: (value) => getterSetter.set(_state, value)
        });
      }
      if (propName) {
        if (typeof _state[propName] === "function") {
          return _state[propName].bind(_state);
        }
        return vue2.computed({
          // @ts-ignore
          get: () => _state[propName],
          set: (value) => {
            _state[propName] = value;
          }
        });
      }
      if (refs) {
        return _stateAndActions;
      }
      vaxee22._stores[name] = useStore;
      return vue2.reactive(_stateAndActions);
    }
    return useStore;
  }
  exports.defineStore = defineStore;
  exports.setVaxeeInstance = setVaxeeInstance;
  exports.vaxeePlugin = vaxeePlugin;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({}, vue);
