import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  vite: {
    define: {
      __TEST__: false,
    },
  },
});
