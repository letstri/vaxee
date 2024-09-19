import { defineNuxtModule, createResolver, addPlugin, addImports, addImportsDir } from '@nuxt/kit';

const module = defineNuxtModule({
  meta: {
    name: "vaxee",
    configKey: "vaxee",
    compatibility: {
      nuxt: ">=3.5.0"
    }
  },
  defaults: {
    dirs: ["stores"]
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    nuxt.options.build.transpile.push(resolver.resolve("./runtime"));
    nuxt.hook("prepare:types", ({ references }) => {
      references.push({ types: "@vaxee/nuxt" });
    });
    nuxt.hook("modules:done", () => {
      addPlugin(resolver.resolve("./runtime/plugin"));
    });
    const composables = resolver.resolve("./runtime/composables");
    addImports([{ from: composables, name: "createStore" }]);
    options.dirs ||= ["stores"];
    for (const storeDir of options.dirs) {
      addImportsDir(resolver.resolve(nuxt.options.srcDir, storeDir));
    }
  }
});

export { module as default };
