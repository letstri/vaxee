import { inject } from "vue";
import { vaxeeSymbol, type Vaxee } from "../plugin";
import { exclude } from "../utils";

export function useVaxeeDebug() {
  const vaxee = inject<Vaxee>(vaxeeSymbol);

  if (!vaxee) {
    throw new Error(
      "[🌱 vaxee]: `useVaxeeDebug` must be used after Vaxee plugin installation."
    );
  }

  return exclude(vaxee, ["install"]);
}
