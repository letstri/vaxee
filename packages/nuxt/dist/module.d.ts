import { NuxtModule } from '@nuxt/schema';

interface ModuleOptions {
    /**
     * Vaxee disables Vuex by default, set this option to `false` to avoid it and
     * use Vaxee alongside Vuex (Nuxt 2 only)
     *
     * @default `true`
     */
    disableVuex?: boolean;
    /**
     * Automatically add stores dirs to the auto imports. This is the same as
     * directly adding the dirs to the `imports.dirs` option. If you want to
     * also import nested stores, you can use the glob pattern `./stores/**`
     *
     * @default `['stores']`
     */
    storesDirs?: string[];
}
declare const module: NuxtModule<ModuleOptions>;

export { type ModuleOptions, module as default };
