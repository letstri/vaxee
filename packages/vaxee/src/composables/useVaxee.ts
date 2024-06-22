import { hasInjectionContext, inject } from "vue";
import { getVaxeeInstance, vaxeeSymbol, type Vaxee } from "../plugin";

export function useVaxee() {
  const hasContext = hasInjectionContext();
  const vaxee = hasContext ? inject<Vaxee>(vaxeeSymbol) : getVaxeeInstance();

  if (!vaxee) {
    throw new Error("[🌱 vaxee]: Seems like you forgot to install the plugin");
  }

  return vaxee;
}
