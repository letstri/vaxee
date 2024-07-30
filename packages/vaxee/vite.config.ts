/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      name: "vaxee",
      entry: "./src/index.ts",
      formats: ["es", "iife"],
      fileName: (format) => `vaxee.${format}.js`,
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
  test: {
    env: {
      TEST: "true",
    },
    browser: {
      enabled: true,
      provider: "webdriverio",
      headless: true,
      name: "chrome",
    },
    alias: {
      vue: "vue/dist/vue.esm-bundler.js",
    },
  },
});
