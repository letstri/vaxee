import { useNuxtApp } from "#app";
export * from "vaxee";
export const useVaxee = () => useNuxtApp().$vaxee;
