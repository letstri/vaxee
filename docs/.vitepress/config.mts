import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vaxee",
  description: "State Manager for Vue 3",
  themeConfig: {
    siteTitle: false,
    logo: "/logo.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "Introduction", link: "/why" },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Why Vaxee?", link: "/why" },
          { text: "Getting Started", link: "/getting-started" },
        ],
      },
      {
        text: "Core Concepts",
        items: [
          { text: "Store", link: "/store" },
          { text: "State & Getters", link: "/reactivity" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/letstri/vaxee" },
      { icon: "npm", link: "https://www.npmjs.com/package/vaxee" },
    ],
  },
});
