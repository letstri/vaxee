import { ref, toRefs, toRef, reactive, unref, computed } from "vue";
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
    state: ref({}),
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
    const _stateAndActions = { ...toRefs(_state), ...actions };
    const getter = typeof getterOrNameOrToRefs === "function" ? getterOrNameOrToRefs : void 0;
    const getterSetter = typeof getterOrNameOrToRefs === "object" ? getterOrNameOrToRefs : void 0;
    const propName = typeof getterOrNameOrToRefs === "string" ? getterOrNameOrToRefs : void 0;
    const refs = getterOrNameOrToRefs === true;
    if (getter) {
      const _getter = toRef(() => getter(reactive(_stateAndActions)));
      return typeof _getter.value === "function" ? unref(_getter).bind(_state) : _getter;
    }
    if (getterSetter) {
      return computed({
        get: () => getterSetter.get(_state),
        set: (value) => getterSetter.set(_state, value)
      });
    }
    if (propName) {
      if (typeof _state[propName] === "function") {
        return _state[propName].bind(_state);
      }
      return computed({
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
    return reactive(_stateAndActions);
  }
  return useStore;
}
export {
  defineStore,
  setVaxeeInstance,
  vaxeePlugin
};
