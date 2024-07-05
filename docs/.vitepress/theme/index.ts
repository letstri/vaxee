import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import { inject } from "@vercel/analytics";
import "./style.css";

export default {
  extends: DefaultTheme,
  enhanceApp() {
    inject();
  },
} satisfies Theme;
