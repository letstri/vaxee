import { createVaxee, type Vaxee } from "vaxee";
import { defineNuxtPlugin, useCookie } from "#app";

export default defineNuxtPlugin<{ vaxee: Vaxee }>({
  name: "vaxee",
  setup(nuxtApp) {
    const vaxee = createVaxee({
      persist: {
        get: (key) => useCookie(key, { readonly: true }).value,
        set: (key, value) => (useCookie(key).value = value),
      },
    });

    nuxtApp.vueApp.use(vaxee);

    if (import.meta.server) {
      nuxtApp.payload.vaxee = vaxee.state.value;
    } else if (nuxtApp.payload && nuxtApp.payload.vaxee) {
      vaxee.state.value = nuxtApp.payload.vaxee as any;
    }
  },
});
