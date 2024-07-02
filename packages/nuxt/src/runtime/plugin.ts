import { createVaxeePlugin, type Vaxee } from "vaxee";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin<{ vaxee: Vaxee }>({
  name: "vaxee",
  setup(nuxtApp) {
    const vaxee = createVaxeePlugin();

    nuxtApp.vueApp.use(vaxee);

    if (import.meta.server) {
      nuxtApp.payload.vaxee = vaxee.state.value;
    } else if (nuxtApp.payload && nuxtApp.payload.vaxee) {
      vaxee.state.value = nuxtApp.payload.vaxee as any;
    }
  },
});
