(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("vue")) : typeof define === "function" && define.amd ? define(["exports", "vue"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.vaxee = {}, global.vue));
})(this, function(exports2, vue) {
  "use strict";
  let vaxeeInstance = null;
  function setVaxeeInstance(instance) {
    vaxeeInstance = instance;
  }
  const getVaxeeInstance = () => vaxeeInstance;
  function vaxeePlugin() {
    const vaxee = {
      install(app) {
        setVaxeeInstance(vaxee);
        app.config.globalProperties.$vaxee = vaxee.state;
        app.provide("vaxee", vaxee.state);
        if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
          console.log(
            "[🌱 vaxee]: Store successfully installed. Enjoy! Also you can check current Vaxee state by using a `$vaxee` property in the `window`."
          );
          window.$vaxee = vaxee.state;
        }
      },
      state: vue.ref({}),
      _actions: {},
      _stores: {}
    };
    return vaxee;
  }
  function defineStore(name, store) {
    const vaxee = getVaxeeInstance();
    if (vaxee == null ? void 0 : vaxee._stores[name]) {
      console.log(
        `[🌱 vaxee]: Store with name "${name}" already exists. Reusing..`
      );
      return vaxee._stores[name];
    }
    function useStore(getterOrNameOrToRefs) {
      var _a, _b;
      const vaxee2 = getVaxeeInstance();
      if (!vaxee2) {
        throw new Error(
          "[🌱 vaxee]: Seems like you forgot to install the plugin"
        );
      }
      const initialStore = store();
      const { initialState, actions } = Object.entries(initialStore).reduce(
        (acc, [key, value]) => {
          if (typeof value === "function") {
            acc.actions[key] = value.bind(
              vaxee2.state.value[name]
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
      (_a = vaxee2.state.value)[name] || (_a[name] = initialState);
      (_b = vaxee2._actions)[name] || (_b[name] = actions);
      const _state = vaxee2.state.value[name];
      const _stateAndActions = { ...vue.toRefs(_state), ...actions };
      const getter = typeof getterOrNameOrToRefs === "function" ? getterOrNameOrToRefs : void 0;
      const getterSetter = typeof getterOrNameOrToRefs === "object" ? getterOrNameOrToRefs : void 0;
      const propName = typeof getterOrNameOrToRefs === "string" ? getterOrNameOrToRefs : void 0;
      const refs = getterOrNameOrToRefs === true;
      if (getter) {
        const _getter = vue.toRef(() => getter(vue.reactive(_stateAndActions)));
        return typeof _getter.value === "function" ? vue.unref(_getter).bind(_state) : _getter;
      }
      if (getterSetter) {
        return vue.computed({
          get: () => getterSetter.get(_state),
          set: (value) => getterSetter.set(_state, value)
        });
      }
      if (propName) {
        if (typeof _state[propName] === "function") {
          return _state[propName].bind(_state);
        }
        return vue.computed({
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
      vaxee2._stores[name] = useStore;
      return vue.reactive(_stateAndActions);
    }
    return useStore;
  }
  exports2.defineStore = defineStore;
  exports2.setVaxeeInstance = setVaxeeInstance;
  exports2.vaxeePlugin = vaxeePlugin;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
