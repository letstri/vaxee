import { ref, hasInjectionContext, inject, shallowRef, watch, computed, unref, reactive } from "vue";
const IS_DEV = process.env.NODE_ENV !== "production";
const IS_CLIENT = typeof window !== "undefined";
const VAXEE_LOG_START = "[🌱 vaxee]: ";
const vaxeeSymbol = Symbol("vaxee");
let vaxeeInstance = null;
function setVaxeeInstance(instance) {
  vaxeeInstance = instance;
}
const getVaxeeInstance = () => vaxeeInstance;
function createVaxee(options = {}) {
  const vaxee = {
    install(app) {
      setVaxeeInstance(vaxee);
      app.provide(vaxeeSymbol, vaxee);
      if (IS_DEV && IS_CLIENT && true) {
        console.log(
          VAXEE_LOG_START + "Store successfully installed. Enjoy! Also you can check current Vaxee state by using a `$vaxee` property in the `window`."
        );
        window.$vaxee = vaxee.state;
      }
    },
    state: ref({}),
    _stores: {},
    _options: options
  };
  return vaxee;
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
const stateSymbol = Symbol("vaxee-state");
const getterSymbol = Symbol("vaxee-getter");
function getDefaultPersist() {
  const vaxee = useVaxee();
  return {
    get: (key) => {
      if (vaxee._options.persist) {
        return vaxee._options.persist.get(key);
      }
      return IS_CLIENT ? JSON.parse(localStorage.getItem(key) || "null") : null;
    },
    set: (key, value) => {
      var _a;
      if (vaxee._options.persist) {
        (_a = vaxee._options.persist) == null ? void 0 : _a.set(key, value);
      } else if (IS_CLIENT) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }
  };
}
function state(value, options) {
  const _ref = (options == null ? void 0 : options.shallow) ? shallowRef(value) : ref(value);
  _ref.StateSymbol = stateSymbol;
  if (typeof (options == null ? void 0 : options.persist) === "object" && "get" in options.persist && "set" in options.persist) {
    _ref._persist = options.persist;
  } else if (typeof (options == null ? void 0 : options.persist) === "string") {
    const { get: _get, set: _set } = getDefaultPersist();
    _ref._persist = {
      get: () => _get(options.persist),
      set: (value2) => _set(options.persist, value2)
    };
  } else {
    _ref._persist = null;
  }
  if (_ref._persist) {
    const persisted = _ref._persist.get();
    if (persisted !== void 0 && persisted !== null) _ref.value = persisted;
    watch(
      _ref,
      (value2) => {
        _ref._persist.set(value2);
      },
      { deep: true }
    );
  }
  return _ref;
}
const isState = (ref2) => (ref2 == null ? void 0 : ref2.StateSymbol) === stateSymbol;
function getter(fn) {
  const ref2 = computed(() => fn());
  ref2.GetterSymbol = getterSymbol;
  return ref2;
}
const isGetter = (ref2) => (ref2 == null ? void 0 : ref2.GetterSymbol) === getterSymbol;
const requestSymbol = Symbol("vaxee-request");
var VaxeeRequestStatus = /* @__PURE__ */ ((VaxeeRequestStatus2) => {
  VaxeeRequestStatus2["NotFetched"] = "not-fetched";
  VaxeeRequestStatus2["Fetching"] = "fetching";
  VaxeeRequestStatus2["Refreshing"] = "refreshing";
  VaxeeRequestStatus2["Error"] = "error";
  VaxeeRequestStatus2["Success"] = "success";
  return VaxeeRequestStatus2;
})(VaxeeRequestStatus || {});
function checkPrivateRequest(request2) {
  if ((request2 == null ? void 0 : request2.RequestSymbol) !== requestSymbol) {
    throw new Error("This is not a private request");
  }
}
function request(callback, options = {}) {
  const q = {
    data: ref(null),
    error: ref(null),
    status: ref(
      options.sendManually ? "not-fetched" : "fetching"
      /* Fetching */
    ),
    suspense: () => Promise.resolve(),
    async execute() {
      q.status.value = "fetching";
      q.data.value = null;
      q.error.value = null;
      const promise = sendRequest();
      q.suspense = () => promise;
      return promise;
    },
    async refresh() {
      q.status.value = "refreshing";
      q.error.value = null;
      const promise = sendRequest();
      q.suspense = () => promise;
      return promise;
    },
    onError(callback2) {
      if (IS_CLIENT) {
        return watch(
          q.error,
          (error) => {
            if (error) {
              callback2(error);
            }
          },
          {
            immediate: true
          }
        );
      }
      return () => {
      };
    },
    onSuccess(callback2) {
      if (IS_CLIENT) {
        return watch(
          q.status,
          (status) => {
            if (status === "success") {
              callback2(q.data.value);
            }
          },
          {
            immediate: true
          }
        );
      }
      return () => {
      };
    }
  };
  let abortController = null;
  const sendRequest = async () => {
    var _a;
    let isAborted = false;
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    abortController.signal.onabort = () => {
      isAborted = true;
    };
    try {
      const data = await callback({ signal: abortController.signal });
      q.data.value = data;
      q.status.value = "success";
      abortController = null;
    } catch (error) {
      if (!isAborted) {
        q.error.value = error;
        q.status.value = "error";
        abortController = null;
        (_a = options.onError) == null ? void 0 : _a.call(options, error);
      }
    }
  };
  function _init(store, key) {
    var _a;
    const vaxee = useVaxee();
    const initial = ((_a = vaxee.state.value[store]) == null ? void 0 : _a[key]) && vaxee.state.value[store][key].status !== "fetching" ? vaxee.state.value[store][key] : void 0;
    if (initial) {
      q.data.value = initial.data;
      q.error.value = initial.error;
      q.status.value = initial.status;
      return q;
    }
    if (!options.sendManually && (IS_CLIENT || options.sendOnServer !== false)) {
      const promise = sendRequest();
      q.suspense = () => promise;
    }
    return q;
  }
  if (options.watch) {
    if (options.watch.some(
      (w) => !isState(w) && !isGetter(w) && typeof w !== "function"
    )) {
      throw new Error(
        VAXEE_LOG_START + "Watch should be an array of refs or computed values"
      );
    }
    watch(options.watch, q.refresh);
  }
  const returning = {
    ...q,
    _init,
    RequestSymbol: requestSymbol
  };
  return returning;
}
const isRequest = (request2) => (request2 == null ? void 0 : request2.RequestSymbol) === requestSymbol;
function parseStore(store) {
  return Object.entries(store).reduce(
    (acc, [key, value]) => {
      if (isState(value)) {
        acc.states[key] = value;
      } else if (isGetter(value)) {
        acc.getters[key] = value;
      } else if (isRequest(value)) {
        acc.requests[key] = value;
      } else if (typeof value === "function") {
        acc.actions[key] = value;
      } else {
        acc.other[key] = unref(value);
      }
      return acc;
    },
    {
      states: {},
      actions: {},
      getters: {},
      requests: {},
      other: {}
    }
  );
}
function prepareStore(name, store) {
  const vaxee = useVaxee();
  if (vaxee._stores[name]) {
    return vaxee._stores[name];
  }
  const { states, actions, getters, requests, other } = parseStore(store);
  if (vaxee.state.value[name]) {
    for (const key in states) {
      states[key].value = vaxee.state.value[name][key];
    }
  }
  const preparedQueries = {};
  for (const key in requests) {
    checkPrivateRequest(requests[key]);
    const request2 = requests[key]._init(name, key);
    states[key] = state({
      data: request2.data,
      status: request2.status
    });
    preparedQueries[key] = request2;
  }
  vaxee.state.value[name] = states;
  vaxee._stores[name] = {
    ...states,
    ...actions,
    ...getters,
    ...preparedQueries,
    ...other,
    _state: states,
    _actions: actions,
    _getters: getters,
    _queries: preparedQueries,
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
    } else {
      throw new Error(
        VAXEE_LOG_START + `The store with name ${name} already exists.`
      );
    }
  }
  function use(propName) {
    if (propName !== void 0 && typeof propName !== "string") {
      throw new Error(
        VAXEE_LOG_START + `The prop name must be a string when using the store "${name}"`
      );
    }
    const _store = prepareStore(
      name,
      store({ state, getter, request, query: request })
    );
    if (propName !== void 0 && !Object.keys(_store).includes(propName)) {
      throw new Error(
        VAXEE_LOG_START + `The prop name "${propName}" does not exist in the store "${name}"`
      );
    }
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
      return computed({
        get: () => _store._state[propName],
        set: (value) => {
          _store._state[propName] = value;
        }
      });
    }
    return _store;
  }
  use.$inferState = {};
  use.reactive = () => reactive(use());
  return use;
};
export {
  VaxeeRequestStatus,
  createStore,
  createVaxee,
  getter,
  request,
  setVaxeeInstance,
  state,
  useVaxee
};
