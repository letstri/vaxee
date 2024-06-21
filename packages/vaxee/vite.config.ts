/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      name: "vaxee",
      entry: "./src/index.ts",
      formats: ["es", "cjs", "iife", "umd"],
      fileName: (format) => `vaxee.${format}.js`,
    },
    rollupOptions: {
      external: ["vue"],
    },
  },
  define: {
    __TEST__: true,
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      name: "chrome",
    },
    alias: {
      vue: "vue/dist/vue.esm-bundler.js",
    },
  },
});
