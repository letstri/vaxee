export { createVaxee, setVaxeeInstance } from "./plugin";
export type { Vaxee } from "./plugin";
export { type VaxeeState, type VaxeeGetter, state, getter, } from "./store/reactivity";
export { VaxeeQueryStatus, type VaxeeQuery, query } from "./store/query";
export { createStore } from "./store/createStore";
export { useVaxee } from "./composables/useVaxee";
