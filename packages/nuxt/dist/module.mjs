import { defineNuxtModule, createResolver, addPlugin, addImports, addImportsDir } from '@nuxt/kit';

const module = defineNuxtModule({
  meta: {
    name: "vaxee",
    configKey: "vaxee",
    compatibility: {
      nuxt: ">=3.0.0"
    }
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
    if (!options.dirs) {
      options.dirs = [resolver.resolve(nuxt.options.srcDir, "stores")];
    }
    if (options.dirs) {
      for (const storeDir of options.dirs) {
        addImportsDir(resolver.resolve(nuxt.options.rootDir, storeDir));
      }
    }
  }
});

export { module as default };
