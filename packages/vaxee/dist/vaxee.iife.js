var vaxee = function(exports, vue2) {
  "use strict";
  class DevalueError extends Error {
    /**
     * @param {string} message
     * @param {string[]} keys
     */
    constructor(message, keys) {
      super(message);
      this.name = "DevalueError";
      this.path = keys.join("");
    }
  }
  function is_primitive(thing) {
    return Object(thing) !== thing;
  }
  const object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(
    Object.prototype
  ).sort().join("\0");
  function is_plain_object(thing) {
    const proto = Object.getPrototypeOf(thing);
    return proto === Object.prototype || proto === null || Object.getOwnPropertyNames(proto).sort().join("\0") === object_proto_names;
  }
  function get_type(thing) {
    return Object.prototype.toString.call(thing).slice(8, -1);
  }
  function get_escaped_char(char) {
    switch (char) {
      case '"':
        return '\\"';
      case "<":
        return "\\u003C";
      case "\\":
        return "\\\\";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "	":
        return "\\t";
      case "\b":
        return "\\b";
      case "\f":
        return "\\f";
      case "\u2028":
        return "\\u2028";
      case "\u2029":
        return "\\u2029";
      default:
        return char < " " ? `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}` : "";
    }
  }
  function stringify_string(str) {
    let result = "";
    let last_pos = 0;
    const len = str.length;
    for (let i = 0; i < len; i += 1) {
      const char = str[i];
      const replacement = get_escaped_char(char);
      if (replacement) {
        result += str.slice(last_pos, i) + replacement;
        last_pos = i + 1;
      }
    }
    return `"${last_pos === 0 ? str : result + str.slice(last_pos)}"`;
  }
  function enumerable_symbols(object) {
    return Object.getOwnPropertySymbols(object).filter(
      (symbol) => Object.getOwnPropertyDescriptor(object, symbol).enumerable
    );
  }
  const is_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
  function stringify_key(key) {
    return is_identifier.test(key) ? "." + key : "[" + JSON.stringify(key) + "]";
  }
  function encode64(arraybuffer) {
    const dv = new DataView(arraybuffer);
    let binaryString = "";
    for (let i = 0; i < arraybuffer.byteLength; i++) {
      binaryString += String.fromCharCode(dv.getUint8(i));
    }
    return binaryToAscii(binaryString);
  }
  function decode64(string) {
    const binaryString = asciiToBinary(string);
    const arraybuffer = new ArrayBuffer(binaryString.length);
    const dv = new DataView(arraybuffer);
    for (let i = 0; i < arraybuffer.byteLength; i++) {
      dv.setUint8(i, binaryString.charCodeAt(i));
    }
    return arraybuffer;
  }
  const KEY_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function asciiToBinary(data) {
    if (data.length % 4 === 0) {
      data = data.replace(/==?$/, "");
    }
    let output = "";
    let buffer = 0;
    let accumulatedBits = 0;
    for (let i = 0; i < data.length; i++) {
      buffer <<= 6;
      buffer |= KEY_STRING.indexOf(data[i]);
      accumulatedBits += 6;
      if (accumulatedBits === 24) {
        output += String.fromCharCode((buffer & 16711680) >> 16);
        output += String.fromCharCode((buffer & 65280) >> 8);
        output += String.fromCharCode(buffer & 255);
        buffer = accumulatedBits = 0;
      }
    }
    if (accumulatedBits === 12) {
      buffer >>= 4;
      output += String.fromCharCode(buffer);
    } else if (accumulatedBits === 18) {
      buffer >>= 2;
      output += String.fromCharCode((buffer & 65280) >> 8);
      output += String.fromCharCode(buffer & 255);
    }
    return output;
  }
  function binaryToAscii(str) {
    let out = "";
    for (let i = 0; i < str.length; i += 3) {
      const groupsOfSix = [void 0, void 0, void 0, void 0];
      groupsOfSix[0] = str.charCodeAt(i) >> 2;
      groupsOfSix[1] = (str.charCodeAt(i) & 3) << 4;
      if (str.length > i + 1) {
        groupsOfSix[1] |= str.charCodeAt(i + 1) >> 4;
        groupsOfSix[2] = (str.charCodeAt(i + 1) & 15) << 2;
      }
      if (str.length > i + 2) {
        groupsOfSix[2] |= str.charCodeAt(i + 2) >> 6;
        groupsOfSix[3] = str.charCodeAt(i + 2) & 63;
      }
      for (let j = 0; j < groupsOfSix.length; j++) {
        if (typeof groupsOfSix[j] === "undefined") {
          out += "=";
        } else {
          out += KEY_STRING[groupsOfSix[j]];
        }
      }
    }
    return out;
  }
  const UNDEFINED = -1;
  const HOLE = -2;
  const NAN = -3;
  const POSITIVE_INFINITY = -4;
  const NEGATIVE_INFINITY = -5;
  const NEGATIVE_ZERO = -6;
  function parse(serialized, revivers) {
    return unflatten(JSON.parse(serialized));
  }
  function unflatten(parsed, revivers) {
    if (typeof parsed === "number") return hydrate(parsed, true);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid input");
    }
    const values = (
      /** @type {any[]} */
      parsed
    );
    const hydrated = Array(values.length);
    function hydrate(index, standalone = false) {
      if (index === UNDEFINED) return void 0;
      if (index === NAN) return NaN;
      if (index === POSITIVE_INFINITY) return Infinity;
      if (index === NEGATIVE_INFINITY) return -Infinity;
      if (index === NEGATIVE_ZERO) return -0;
      if (standalone) throw new Error(`Invalid input`);
      if (index in hydrated) return hydrated[index];
      const value = values[index];
      if (!value || typeof value !== "object") {
        hydrated[index] = value;
      } else if (Array.isArray(value)) {
        if (typeof value[0] === "string") {
          const type = value[0];
          switch (type) {
            case "Date":
              hydrated[index] = new Date(value[1]);
              break;
            case "Set":
              const set = /* @__PURE__ */ new Set();
              hydrated[index] = set;
              for (let i = 1; i < value.length; i += 1) {
                set.add(hydrate(value[i]));
              }
              break;
            case "Map":
              const map = /* @__PURE__ */ new Map();
              hydrated[index] = map;
              for (let i = 1; i < value.length; i += 2) {
                map.set(hydrate(value[i]), hydrate(value[i + 1]));
              }
              break;
            case "RegExp":
              hydrated[index] = new RegExp(value[1], value[2]);
              break;
            case "Object":
              hydrated[index] = Object(value[1]);
              break;
            case "BigInt":
              hydrated[index] = BigInt(value[1]);
              break;
            case "null":
              const obj = /* @__PURE__ */ Object.create(null);
              hydrated[index] = obj;
              for (let i = 1; i < value.length; i += 2) {
                obj[value[i]] = hydrate(value[i + 1]);
              }
              break;
            case "Int8Array":
            case "Uint8Array":
            case "Uint8ClampedArray":
            case "Int16Array":
            case "Uint16Array":
            case "Int32Array":
            case "Uint32Array":
            case "Float32Array":
            case "Float64Array":
            case "BigInt64Array":
            case "BigUint64Array": {
              const TypedArrayConstructor = globalThis[type];
              const base64 = value[1];
              const arraybuffer = decode64(base64);
              const typedArray = new TypedArrayConstructor(arraybuffer);
              hydrated[index] = typedArray;
              break;
            }
            case "ArrayBuffer": {
              const base64 = value[1];
              const arraybuffer = decode64(base64);
              hydrated[index] = arraybuffer;
              break;
            }
            default:
              throw new Error(`Unknown type ${type}`);
          }
        } else {
          const array = new Array(value.length);
          hydrated[index] = array;
          for (let i = 0; i < value.length; i += 1) {
            const n = value[i];
            if (n === HOLE) continue;
            array[i] = hydrate(n);
          }
        }
      } else {
        const object = {};
        hydrated[index] = object;
        for (const key in value) {
          const n = value[key];
          object[key] = hydrate(n);
        }
      }
      return hydrated[index];
    }
    return hydrate(0);
  }
  function stringify(value, reducers) {
    const stringified = [];
    const indexes = /* @__PURE__ */ new Map();
    const custom = [];
    const keys = [];
    let p = 0;
    function flatten(thing) {
      if (typeof thing === "function") {
        throw new DevalueError(`Cannot stringify a function`, keys);
      }
      if (indexes.has(thing)) return indexes.get(thing);
      if (thing === void 0) return UNDEFINED;
      if (Number.isNaN(thing)) return NAN;
      if (thing === Infinity) return POSITIVE_INFINITY;
      if (thing === -Infinity) return NEGATIVE_INFINITY;
      if (thing === 0 && 1 / thing < 0) return NEGATIVE_ZERO;
      const index2 = p++;
      indexes.set(thing, index2);
      for (const { key, fn } of custom) {
        const value2 = fn(thing);
        if (value2) {
          stringified[index2] = `["${key}",${flatten(value2)}]`;
          return index2;
        }
      }
      let str = "";
      if (is_primitive(thing)) {
        str = stringify_primitive(thing);
      } else {
        const type = get_type(thing);
        switch (type) {
          case "Number":
          case "String":
          case "Boolean":
            str = `["Object",${stringify_primitive(thing)}]`;
            break;
          case "BigInt":
            str = `["BigInt",${thing}]`;
            break;
          case "Date":
            const valid = !isNaN(thing.getDate());
            str = `["Date","${valid ? thing.toISOString() : ""}"]`;
            break;
          case "RegExp":
            const { source, flags } = thing;
            str = flags ? `["RegExp",${stringify_string(source)},"${flags}"]` : `["RegExp",${stringify_string(source)}]`;
            break;
          case "Array":
            str = "[";
            for (let i = 0; i < thing.length; i += 1) {
              if (i > 0) str += ",";
              if (i in thing) {
                keys.push(`[${i}]`);
                str += flatten(thing[i]);
                keys.pop();
              } else {
                str += HOLE;
              }
            }
            str += "]";
            break;
          case "Set":
            str = '["Set"';
            for (const value2 of thing) {
              str += `,${flatten(value2)}`;
            }
            str += "]";
            break;
          case "Map":
            str = '["Map"';
            for (const [key, value2] of thing) {
              keys.push(
                `.get(${is_primitive(key) ? stringify_primitive(key) : "..."})`
              );
              str += `,${flatten(key)},${flatten(value2)}`;
              keys.pop();
            }
            str += "]";
            break;
          case "Int8Array":
          case "Uint8Array":
          case "Uint8ClampedArray":
          case "Int16Array":
          case "Uint16Array":
          case "Int32Array":
          case "Uint32Array":
          case "Float32Array":
          case "Float64Array":
          case "BigInt64Array":
          case "BigUint64Array": {
            const typedArray = thing;
            const base64 = encode64(typedArray.buffer);
            str = '["' + type + '","' + base64 + '"]';
            break;
          }
          case "ArrayBuffer": {
            const arraybuffer = thing;
            const base64 = encode64(arraybuffer);
            str = `["ArrayBuffer","${base64}"]`;
            break;
          }
          default:
            if (!is_plain_object(thing)) {
              throw new DevalueError(
                `Cannot stringify arbitrary non-POJOs`,
                keys
              );
            }
            if (enumerable_symbols(thing).length > 0) {
              throw new DevalueError(
                `Cannot stringify POJOs with symbolic keys`,
                keys
              );
            }
            if (Object.getPrototypeOf(thing) === null) {
              str = '["null"';
              for (const key in thing) {
                keys.push(stringify_key(key));
                str += `,${stringify_string(key)},${flatten(thing[key])}`;
                keys.pop();
              }
              str += "]";
            } else {
              str = "{";
              let started = false;
              for (const key in thing) {
                if (started) str += ",";
                started = true;
                keys.push(stringify_key(key));
                str += `${stringify_string(key)}:${flatten(thing[key])}`;
                keys.pop();
              }
              str += "}";
            }
        }
      }
      stringified[index2] = str;
      return index2;
    }
    const index = flatten(value);
    if (index < 0) return `${index}`;
    return `[${stringified.join(",")}]`;
  }
  function stringify_primitive(thing) {
    const type = typeof thing;
    if (type === "string") return stringify_string(thing);
    if (thing instanceof String) return stringify_string(thing.toString());
    if (thing === void 0) return UNDEFINED.toString();
    if (thing === 0 && 1 / thing < 0) return NEGATIVE_ZERO.toString();
    if (type === "bigint") return `["BigInt","${thing}"]`;
    return String(thing);
  }
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
    const vaxee2 = {
      install(app) {
        setVaxeeInstance(vaxee2);
        app.provide(vaxeeSymbol, vaxee2);
        if (IS_DEV && IS_CLIENT && true) {
          console.log(
            VAXEE_LOG_START + "Store successfully installed. Enjoy! Also you can check current Vaxee state by calling a `$vaxee()` method in the `window`."
          );
          window.$vaxee = () => parse(stringify(vue2.reactive(vaxee2.state)))._value;
        }
      },
      state: vue2.ref({}),
      _stores: {},
      _options: options
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
  function getDefaultPersist() {
    const vaxee2 = useVaxee();
    return {
      get: (key) => {
        if (vaxee2._options.persist) {
          return vaxee2._options.persist.get(key);
        }
        return IS_CLIENT ? JSON.parse(localStorage.getItem(key) || "null") : null;
      },
      set: (key, value) => {
        var _a;
        if (vaxee2._options.persist) {
          (_a = vaxee2._options.persist) == null ? void 0 : _a.set(key, value);
        } else if (IS_CLIENT) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
    };
  }
  function state(value, options) {
    const _ref = (options == null ? void 0 : options.shallow) ? vue2.shallowRef(value) : vue2.ref(value);
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
      vue2.watch(
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
    const ref2 = vue2.computed(() => fn());
    ref2.GetterSymbol = getterSymbol;
    return ref2;
  }
  const isGetter = (ref2) => (ref2 == null ? void 0 : ref2.GetterSymbol) === getterSymbol;
  const requestSymbol = Symbol("vaxee-request");
  var VaxeeRequestStatus = /* @__PURE__ */ ((VaxeeRequestStatus2) => {
    VaxeeRequestStatus2["Idle"] = "idle";
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
    if (!options.mode) {
      if (options.sendManually) {
        console.warn(
          VAXEE_LOG_START + "`sendManually` is deprecated. Use `mode: 'manual'` instead."
        );
        options.mode = "manual";
      } else if (options.sendOnServer) {
        console.warn(
          VAXEE_LOG_START + "`sendOnServer` is deprecated. Use `mode: 'client'` instead."
        );
        options.mode = "client";
      }
    }
    options.mode || (options.mode = "auto");
    const _param = vue2.ref(void 0);
    const q = {
      data: vue2.ref(null),
      error: vue2.ref(null),
      status: vue2.ref(
        options.mode === "manual" ? "idle" : "fetching"
        /* Fetching */
      ),
      suspense: () => Promise.resolve(),
      async execute(param) {
        if (param) {
          _param.value = param;
        }
        q.status.value = "fetching";
        q.data.value = null;
        q.error.value = null;
        const promise = sendRequest();
        q.suspense = async () => {
          await promise;
        };
        return promise;
      },
      async refresh() {
        q.status.value = "refreshing";
        q.error.value = null;
        const promise = sendRequest();
        q.suspense = async () => {
          await promise;
        };
        return promise;
      },
      onError(callback2) {
        if (IS_CLIENT) {
          return vue2.watch(
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
          return vue2.watch(
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
        const data = await callback({
          signal: abortController.signal,
          param: _param.value
        });
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
      const vaxee2 = useVaxee();
      const initial = ((_a = vaxee2.state.value[store]) == null ? void 0 : _a[key]) && vaxee2.state.value[store][key].status !== "fetching" ? vaxee2.state.value[store][key] : void 0;
      if (initial) {
        q.data.value = initial.data;
        q.error.value = initial.error;
        q.status.value = initial.status;
        return q;
      }
      if (options.mode === "auto" || options.mode === "client") {
        const promise = options.mode === "auto" || IS_CLIENT && options.mode === "client" ? sendRequest() : Promise.resolve();
        const instance = vue2.getCurrentInstance();
        if (options.mode === "auto" && instance) {
          vue2.onServerPrefetch(() => promise, instance);
        }
        q.suspense = async () => {
          await promise;
        };
      }
      return q;
    }
    if (options.watch) {
      if (options.watch.some(
        (w) => !isState(w) && !isGetter(w) && typeof w !== "function"
      )) {
        throw new Error(
          VAXEE_LOG_START + "Watch should be an array of `state` or `getter` or `function` that returns a value"
        );
      }
      if (IS_CLIENT) {
        vue2.watch(options.watch, q.refresh);
      }
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
          acc.other[key] = vue2.unref(value);
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
    const vaxee2 = useVaxee();
    if (vaxee2._stores[name]) {
      return vaxee2._stores[name];
    }
    const { states, actions, getters, requests, other } = parseStore(store);
    if (vaxee2.state.value[name]) {
      for (const key in states) {
        states[key].value = vaxee2.state.value[name][key];
      }
    }
    const preparedRequests = {};
    for (const key in requests) {
      checkPrivateRequest(requests[key]);
      const request2 = requests[key]._init(name, key);
      states[key] = state({
        data: request2.data,
        status: request2.status
      });
      preparedRequests[key] = request2;
    }
    vaxee2.state.value[name] = states;
    vaxee2._stores[name] = {
      ...states,
      ...actions,
      ...getters,
      ...preparedRequests,
      ...other,
      _state: states,
      _actions: actions,
      _getters: getters,
      _requests: preparedRequests,
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
          VAXEE_LOG_START + `The store with name "${name}" already exists. In production, this will throw an error.`
        );
      } else {
        throw new Error(
          VAXEE_LOG_START + `The store with name "${name}" already exists.`
        );
      }
    }
    function use(propName) {
      if (propName !== void 0 && typeof propName !== "string") {
        throw new Error(
          VAXEE_LOG_START + `The prop name must be a string when using the store "${name}"`
        );
      }
      const _store = prepareStore(name, store({ state, getter, request }));
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
        if (_store._requests[propName]) {
          const request2 = _store._requests[propName];
          const requestPromise = Promise.resolve(request2.suspense()).then(
            () => request2
          );
          Object.assign(requestPromise, request2);
          return requestPromise;
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
      return _store;
    }
    use.$inferState = {};
    use.reactive = () => vue2.reactive(use());
    return use;
  };
  exports.VaxeeRequestStatus = VaxeeRequestStatus;
  exports.createStore = createStore;
  exports.createVaxee = createVaxee;
  exports.getter = getter;
  exports.request = request;
  exports.setVaxeeInstance = setVaxeeInstance;
  exports.state = state;
  exports.useVaxee = useVaxee;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
}({}, vue);
