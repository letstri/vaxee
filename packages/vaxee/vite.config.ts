import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "~": "./src",
    },
  },
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
});
