import { createVaxee, type Vaxee } from "vaxee";
import { defineNuxtPlugin, useCookie } from "#app";
import type { Ref } from "vue";

export default defineNuxtPlugin<{ vaxee: Vaxee }>({
  name: "vaxee",
  setup(nuxtApp) {
    const cookieMap = new Map<string, Ref<any>>();

    const cookie = (key: string) => {
      if (!cookieMap.get(key))
        cookieMap.set(
          key,
          useCookie(key, {
            maxAge: 2147483646,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
          })
        );

      return cookieMap.get(key)!;
    };

    const vaxee = createVaxee({
      persist: {
        get: (key) => cookie(key).value,
        set: (key, value) => (cookie(key).value = value),
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
