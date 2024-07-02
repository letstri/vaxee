/**
 * @module @vaxee/nuxt
 */
import {
  defineNuxtModule,
  addPlugin,
  addImports,
  createResolver,
  addImportsDir,
} from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";

export interface ModuleOptions {
  /**
   * Automatically add stores dirs to the auto imports. This is the same as
   * directly adding the dirs to the `imports.dirs` option. If you want to
   * also import nested stores, you can use the glob pattern `./stores/**`
   *
   * @default `['stores']`
   */
  dirs?: string[];
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: "vaxee",
    configKey: "vaxee",
    compatibility: {
      nuxt: ">=3.0.0",
    },
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    // Transpile runtime
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
  },
});

export default module;
