import { vaxeePlugin, setVaxeeInstance } from "vaxee";
import { defineNuxtPlugin } from "#app";
export default defineNuxtPlugin({
  name: "vaxee",
  setup(nuxtApp) {
    const vaxee = vaxeePlugin();
    nuxtApp.vueApp.use(vaxee);
    setVaxeeInstance(vaxee);
    if (import.meta.server) {
      nuxtApp.payload.vaxee = vaxee.state.value;
    } else if (nuxtApp.payload && nuxtApp.payload.vaxee) {
      vaxee.state.value = nuxtApp.payload.vaxee;
    }
    return {
      provide: {
        vaxee
      }
    };
  }
});
