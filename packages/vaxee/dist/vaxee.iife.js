var vaxee = function(exports, vue2) {
  "use strict";
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
    const vaxee2 = {
      install(app) {
        setVaxeeInstance(vaxee2);
        app.provide(vaxeeSymbol, vaxee2);
        if (IS_DEV && IS_CLIENT) {
          window.$vaxee = vaxee2.state;
        }
      },
      state: vue2.ref({}),
      _stores: {}
    };
    return vaxee2;
  }
  function useVaxee() {
    const hasContext = vue2.hasInjectionContext();
    const vaxee2 = hasContext ? vue2.inject(vaxeeSymbol) : getVaxeeInstance();
    if (!vaxee2) {
      throw new Error(
        VAXEE_LOG_START + "Seems like you forgot to install the plugin"
      );
    }
    return vaxee2;
  }
  const stateSymbol = Symbol("vaxee-state");
  const getterSymbol = Symbol("vaxee-getter");
  const state = (value) => {
    const _ref = vue2.ref(value);
    _ref._vaxee = stateSymbol;
    return _ref;
  };
  const isState = (ref2) => (ref2 == null ? void 0 : ref2._vaxee) === stateSymbol;
  const getter = (fn) => {
    const ref2 = vue2.computed(() => fn());
    ref2._vaxee = getterSymbol;
    return ref2;
  };
  const isGetter = (ref2) => (ref2 == null ? void 0 : ref2._vaxee) === getterSymbol;
  const querySymbol = Symbol("vaxee-query");
  function query(callback) {
    function _query(options) {
      const _options = options;
      const q = {
        data: vue2.ref(null),
        error: vue2.ref(null),
        status: vue2.ref("pending")
      };
      const fetchQuery = async () => {
        try {
          const data = await callback();
          q.data.value = data;
          q.status.value = "success";
        } catch (error) {
          q.error.value = error;
          q.status.value = "error";
        }
      };
      q.refresh = async () => {
        q.status.value = "pending";
        q.error.value = null;
        const promise2 = fetchQuery();
        q.suspense = () => promise2;
        return promise2;
      };
      if (_options == null ? void 0 : _options.initial) {
        q.data.value = _options == null ? void 0 : _options.initial.data;
        q.error.value = _options == null ? void 0 : _options.initial.error;
        q.status.value = _options == null ? void 0 : _options.initial.status;
        q.suspense = () => Promise.resolve();
        return q;
      }
      const promise = fetchQuery();
      q.suspense = () => promise;
      return q;
    }
    _query._vaxee = querySymbol;
    return _query;
  }
  const isQuery = (query2) => (query2 == null ? void 0 : query2._vaxee) === querySymbol;
  function parseStore(store) {
    return Object.entries(store).reduce(
      (acc, [key, value]) => {
        if (isState(value)) {
          acc.states[key] = value;
        } else if (isGetter(value)) {
          acc.getters[key] = value;
        } else if (isQuery(value)) {
          acc.queries[key] = value;
        } else if (typeof value === "function") {
          acc.actions[key] = value;
        } else {
          acc.other[key] = vue2.unref(value);
        }
        return acc;
      },
      {
        states: {},
        actions: {},
        getters: {},
        queries: {},
        other: {}
      }
    );
  }
  function prepareStore(name, store) {
    var _a;
    const vaxee2 = useVaxee();
    if (vaxee2._stores[name]) {
      return vaxee2._stores[name];
    }
    const { states, actions, getters, queries, other } = parseStore(store);
    const preparedQueries = {};
    if (vaxee2.state.value[name]) {
      for (const key in states) {
        states[key].value = vaxee2.state.value[name][key];
      }
    }
    for (const key in queries) {
      const query2 = queries[key]({
        initial: ((_a = vaxee2.state.value[name]) == null ? void 0 : _a[key]) && vaxee2.state.value[name][key].status !== "pending" ? {
          data: vaxee2.state.value[name][key].data,
          status: vaxee2.state.value[name][key].status,
          error: vaxee2.state.value[name][key].error
        } : void 0
      });
      states[key] = state({
        data: query2.data,
        error: query2.error,
        status: query2.status
      });
      preparedQueries[key] = query2;
    }
    vaxee2.state.value[name] = states;
    vaxee2._stores[name] = {
      ...vue2.toRefs(vaxee2.state.value[name]),
      ...actions,
      ...getters,
      ...preparedQueries,
      ...other,
      _state: vaxee2.state.value[name],
      _actions: actions,
      _getters: getters,
      _queries: preparedQueries,
      _other: other
    };
    Object.defineProperty(vaxee2._stores[name], "_state", {
      get: () => vaxee2.state.value[name],
      set: (state2) => {
        Object.assign(vaxee2.state.value[name], state2);
      }
    });
    return vaxee2._stores[name];
  }
  const createStore = (name, store) => {
    var _a;
    if ((_a = getVaxeeInstance()) == null ? void 0 : _a._stores[name]) {
      if (IS_DEV) {
        console.warn(
          VAXEE_LOG_START + `The store with name ${name} already exists.`
        );
      } else {
        throw new Error(
          VAXEE_LOG_START + `The store with name ${name} already exists.`
        );
      }
    }
    function use(nameOrToRefs) {
      const propName = typeof nameOrToRefs === "string" ? nameOrToRefs : void 0;
      const refs = nameOrToRefs === true || nameOrToRefs === void 0;
      const _store = prepareStore(name, store({ state, getter, query }));
      if (propName) {
        if (_store._actions[propName]) {
          return _store._actions[propName];
        }
        if (_store._getters[propName]) {
          return _store._getters[propName];
        }
        if (_store._queries[propName]) {
          return _store._queries[propName];
        }
        if (_store._other[propName]) {
          return _store._other[propName];
        }
        return vue2.computed({
          get: () => _store._state[propName],
          set: (value) => {
            _store._state[propName] = value;
          }
        });
      }
      if (refs) {
        return _store;
      }
      return vue2.reactive(_store);
    }
    use.$inferState = {};
    return use;
  };
  exports.createStore = createStore;
  exports.createVaxeePlugin = createVaxeePlugin;
  exports.setVaxeeInstance = setVaxeeInstance;
  exports.useVaxee = useVaxee;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({}, vue);
