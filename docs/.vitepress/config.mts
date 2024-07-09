import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vaxee - State Manager for Vue 3, Pinia alternative",
  description: "State Manager for Vue 3 with cache, query, and more features.",
  themeConfig: {
    siteTitle: false,
    logo: "/logo.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "Introduction", link: "/why" },
      {
        text: "Playground",
        link: "https://stackblitz.com/edit/vaxee-playground?file=src%2FApp.vue",
      },
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
          { text: "State", link: "/state" },
          { text: "Getters", link: "/getters" },
          { text: "Query", link: "/query" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/letstri/vaxee" },
      { icon: "npm", link: "https://www.npmjs.com/package/vaxee" },
    ],
  },
});
