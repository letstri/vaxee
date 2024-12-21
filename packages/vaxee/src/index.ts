export { createVaxee, setVaxeeInstance } from "./plugin";
export type { Vaxee } from "./plugin";
export {
  type VaxeeState,
  type VaxeeGetter,
  state,
  getter,
} from "./store/reactivity";
export {
  VaxeeRequestStatus,
  type VaxeeRequestParams,
  type VaxeeRequest,
  request,
} from "./store/request";
export { createStore } from "./store/createStore";
export { useVaxee } from "./composables/useVaxee";
