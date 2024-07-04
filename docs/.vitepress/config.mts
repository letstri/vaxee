import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vaxee",
  description: "State Manager for Vue 3",
  themeConfig: {
    siteTitle: false,
    logo: "/logo.svg",
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
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
          { text: "Reactivity", link: "/reactivity" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/letstri/vaxee" },
      { icon: "npm", link: "https://www.npmjs.com/package/vaxee" },
    ],
  },
});
