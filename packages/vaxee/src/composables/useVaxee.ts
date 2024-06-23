import { hasInjectionContext, inject } from "vue";
import { getVaxeeInstance, vaxeeSymbol, type Vaxee } from "../plugin";
import { VAXEE_LOG_START } from "../constants";

export function useVaxee() {
  const hasContext = hasInjectionContext();
  const vaxee = hasContext ? inject<Vaxee>(vaxeeSymbol) : getVaxeeInstance();

  if (!vaxee) {
    throw new Error(
      VAXEE_LOG_START + "Seems like you forgot to install the plugin"
    );
  }

  return vaxee;
}
